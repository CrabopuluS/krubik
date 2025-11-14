"""Dependency container for the FastAPI application."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import Annotated

import httpx
import structlog
from fastapi import Depends, Request
from pydantic import Field
from pydantic_settings import BaseSettings
from slowapi import Limiter
from slowapi.util import get_remote_address

from .services.cube_validator import CubeValidator
from .services.solver_client import (
    CircuitBreaker,
    CircuitBreakerOpenError,
    ExternalSolverClient,
    ExternalSolverError,
)
from .services.solver_local import LocalSolver
from .services.types import NormalizedCubeState


class Settings(BaseSettings):
    """Application configuration sourced from environment variables."""

    environment: str = Field(default="development")
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    solver_api_url: str | None = Field(default=None)
    solver_api_timeout_seconds: float = Field(default=5.0, ge=0.1, le=30.0)
    solver_api_retries: int = Field(default=2, ge=0, le=5)
    solver_api_circuit_threshold: int = Field(default=3, ge=1, le=10)
    solver_api_circuit_reset_seconds: float = Field(default=30.0, ge=1.0, le=120.0)
    solver_cache_size: int = Field(default=256, ge=32, le=1024)
    rate_limit: str = Field(default="10/minute")
    csrf_cookie_name: str = Field(default="csrf_token")
    csrf_header_name: str = Field(default="X-CSRF-Token")
    log_level: str = Field(default="INFO")
    external_solver_enabled: bool = Field(default=True)

    model_config = {
        "env_file": ".env",
        "env_prefix": "KRUBIK_",
        "case_sensitive": False,
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


@lru_cache(maxsize=1)
def get_limiter() -> Limiter:
    return Limiter(key_func=get_remote_address)


@lru_cache(maxsize=1)
def get_local_solver(settings: Settings | None = None) -> LocalSolver:
    cfg = settings or get_settings()
    return LocalSolver(cache_size=cfg.solver_cache_size)


@lru_cache(maxsize=1)
def get_cube_validator(local_solver: LocalSolver | None = None) -> CubeValidator:
    solver = local_solver or get_local_solver()
    return CubeValidator(local_solver=solver)


@lru_cache(maxsize=1)
def get_circuit_breaker(settings: Settings | None = None) -> CircuitBreaker:
    cfg = settings or get_settings()
    return CircuitBreaker(
        threshold=cfg.solver_api_circuit_threshold,
        reset_timeout=cfg.solver_api_circuit_reset_seconds,
    )


@asynccontextmanager
async def http_client_lifespan(settings: Settings) -> AsyncIterator[httpx.AsyncClient]:
    timeout = httpx.Timeout(settings.solver_api_timeout_seconds)
    async with httpx.AsyncClient(timeout=timeout) as client:
        yield client


class SolverFacade:
    """Combine the external client and the local solver with async API."""

    def __init__(
        self,
        *,
        external_client: ExternalSolverClient | None,
        local_solver: LocalSolver,
    ) -> None:
        self._external_client = external_client
        self._local_solver = local_solver
        self._lock = asyncio.Lock()
        self._logger = structlog.get_logger(__name__)

    async def solve(self, state: NormalizedCubeState) -> tuple[list[str], str]:
        try:
            if self._external_client is not None:
                moves = await self._external_client.solve(state)
                return list(moves), "external"
        except (CircuitBreakerOpenError, ExternalSolverError, httpx.HTTPError) as exc:
            # The external solver failed; log the sanitized error and fallback to the local solver.
            self._logger.warning("external_solver_fallback", error=str(exc))
            self._external_client = None

        async with self._lock:
            moves = await asyncio.to_thread(self._local_solver.solve, state)
            return list(moves), "local"


async def get_solver_facade(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    local_solver: Annotated[LocalSolver, Depends(get_local_solver)],
    circuit_breaker: Annotated[CircuitBreaker, Depends(get_circuit_breaker)],
) -> SolverFacade:
    http_client: httpx.AsyncClient | None = getattr(request.app.state, "http_client", None)
    external_client: ExternalSolverClient | None = None
    if settings.external_solver_enabled and settings.solver_api_url and http_client is not None:
        external_client = ExternalSolverClient(
            client=http_client,
            endpoint=settings.solver_api_url,
            timeout_seconds=settings.solver_api_timeout_seconds,
            max_retries=settings.solver_api_retries,
            circuit_breaker=circuit_breaker,
        )
    return SolverFacade(external_client=external_client, local_solver=local_solver)
