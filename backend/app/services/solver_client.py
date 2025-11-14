"""HTTP client wrapper for the external solver API."""

from __future__ import annotations

import asyncio
import hashlib
import time
from dataclasses import dataclass
from typing import Any, Iterable, Mapping

import httpx
import structlog

from .types import MoveSequence, NormalizedCubeState

_LOGGER = structlog.get_logger(__name__)


class CircuitBreakerOpenError(RuntimeError):
    """Raised when the circuit breaker is open."""


@dataclass(slots=True)
class ExternalSolverError(RuntimeError):
    """Raised when the external solver cannot provide a solution."""

    message_key: str
    context: Mapping[str, object] | None = None


class CircuitBreaker:
    """Simple circuit breaker implementation for async workflows."""

    def __init__(self, *, threshold: int, reset_timeout: float) -> None:
        self._threshold = threshold
        self._reset_timeout = reset_timeout
        self._failure_count = 0
        self._state: str = "closed"
        self._opened_at: float = 0.0
        self._lock = asyncio.Lock()

    async def before_call(self) -> None:
        async with self._lock:
            if self._state == "open":
                elapsed = time.monotonic() - self._opened_at
                if elapsed < self._reset_timeout:
                    raise CircuitBreakerOpenError("Circuit breaker open")
                self._state = "half_open"

    async def record_success(self) -> None:
        async with self._lock:
            self._failure_count = 0
            self._state = "closed"

    async def record_failure(self) -> None:
        async with self._lock:
            self._failure_count += 1
            if self._failure_count >= self._threshold:
                self._state = "open"
                self._opened_at = time.monotonic()


class ExternalSolverClient:
    """Wrapper around an HTTPX client with retry and circuit breaker."""

    def __init__(
        self,
        *,
        client: httpx.AsyncClient,
        endpoint: str | None,
        timeout_seconds: float,
        max_retries: int,
        circuit_breaker: CircuitBreaker,
    ) -> None:
        self._client = client
        self._endpoint = endpoint
        self._timeout = timeout_seconds
        self._max_retries = max_retries
        self._breaker = circuit_breaker

    @staticmethod
    def _hash_state(state: NormalizedCubeState) -> str:
        digest = hashlib.sha256(state.encode("utf-8")).hexdigest()
        return digest[:12]

    async def solve(self, state: NormalizedCubeState) -> MoveSequence:
        if not self._endpoint:
            raise ExternalSolverError("external_disabled", None)

        await self._breaker.before_call()

        attempt = 0
        delay = 0.2
        last_error: Exception | None = None
        while attempt <= self._max_retries:
            try:
                response = await self._client.post(
                    self._endpoint,
                    json={"state": state},
                    timeout=self._timeout,
                )
                if response.status_code >= 500:
                    raise ExternalSolverError(
                        "external_unavailable",
                        {"status_code": response.status_code},
                    )
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, Mapping):
                    raise ExternalSolverError("invalid_response", None)
                moves = self._parse_moves(payload)
                await self._breaker.record_success()
                return moves
            except CircuitBreakerOpenError:
                raise
            except httpx.TimeoutException as exc:
                last_error = exc
                await self._breaker.record_failure()
                _LOGGER.warning(
                    "external_solver_timeout",
                    state_hash=self._hash_state(state),
                    attempt=attempt,
                )
            except httpx.HTTPError as exc:
                last_error = exc
                await self._breaker.record_failure()
                _LOGGER.warning(
                    "external_solver_http_error",
                    state_hash=self._hash_state(state),
                    attempt=attempt,
                    detail=str(exc),
                )
            except ExternalSolverError as exc:
                last_error = exc
                await self._breaker.record_failure()
                _LOGGER.warning(
                    "external_solver_error_response",
                    state_hash=self._hash_state(state),
                    attempt=attempt,
                    status=exc.context,
                )
            except Exception as exc:  # pragma: no cover - defensive
                last_error = exc
                await self._breaker.record_failure()
                _LOGGER.exception(
                    "external_solver_unexpected_error",
                    state_hash=self._hash_state(state),
                )

            attempt += 1
            await asyncio.sleep(delay)
            delay = min(delay * 2, 2.0)

        raise ExternalSolverError(
            "external_unreachable",
            {"error": str(last_error) if last_error else None},
        )

    @staticmethod
    def _parse_moves(payload: Mapping[str, Any]) -> MoveSequence:
        moves = payload.get("moves")
        if isinstance(moves, str) or not isinstance(moves, Iterable):
            raise ExternalSolverError("invalid_response", None)
        sequence = tuple(str(move) for move in moves)
        return sequence
