"""FastAPI application entry point."""

from __future__ import annotations

import hashlib
import logging
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import structlog

from .dependencies import (
    Settings,
    SolverFacade,
    get_cube_validator,
    get_limiter,
    get_settings,
    get_solver_facade,
    http_client_lifespan,
)
from .localization import resolve_language, translate
from .services.cube_validator import CubeValidationError, CubeValidator
from .services.types import NormalizedCubeState

LOGGER = structlog.get_logger(__name__)


def configure_logging(level: str) -> None:
    """Configure structlog for JSON output."""

    logging.basicConfig(level=getattr(logging, level.upper(), logging.INFO))
    structlog.configure(
        processors=[
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, level.upper(), logging.INFO),
        ),
    )


settings = get_settings()
limiter = get_limiter()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(settings.log_level)
    app.state.limiter = limiter
    app.state.rate_limit = settings.rate_limit
    async with http_client_lifespan(settings) as client:
        app.state.http_client = client
        yield


class SolveRequest(BaseModel):
    """Schema representing a request to solve a cube state."""

    state: str = Field(..., min_length=1, description="Serialized cube state")

    model_config = {
        "json_schema_extra": {
            "example": {
                "state": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
            }
        }
    }


class SolveResponse(BaseModel):
    """Schema representing the solver response."""

    moves: list[str]
    source: str


def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    language = resolve_language(request.headers.get("Accept-Language"))
    message = translate("rate_limited", language)
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"code": "rate_limited", "message": message},
    )


app = FastAPI(title="Krubik Solver", version="0.2.0", lifespan=lifespan)
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


def mask_state(state: NormalizedCubeState) -> str:
    digest = hashlib.sha256(state.encode("utf-8")).hexdigest()
    return digest[:12]

@app.post("/solve", response_model=SolveResponse)
async def solve_cube(
    request: Request,
    response: Response,
    payload: SolveRequest,
    accept_language: Annotated[str | None, Header(alias="Accept-Language")] = None,
    settings_dependency: Settings = Depends(get_settings),
    validator: CubeValidator = Depends(get_cube_validator),
    solver_facade: SolverFacade = Depends(get_solver_facade),
) -> SolveResponse:
    """Validate cube state, solve it and return the move sequence."""

    language = resolve_language(accept_language)
    if limiter.enabled:
        limiter._check_request_limit(request, solve_cube, False)
    csrf_cookie = request.cookies.get(settings_dependency.csrf_cookie_name)
    csrf_header = request.headers.get(settings_dependency.csrf_header_name)
    if not csrf_cookie or csrf_cookie != csrf_header:
        message = translate("invalid_csrf", language)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "invalid_csrf", "message": message},
        )

    try:
        normalized = validator.validate(payload.state)
    except CubeValidationError as exc:
        message = translate(exc.message_key, language, **(exc.context or {}))
        LOGGER.info(
            "validation_error",
            code=exc.message_key,
            state_hash=mask_state(payload.state),
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": exc.message_key, "message": message},
        ) from exc

    moves, source = await solver_facade.solve(normalized)
    result = SolveResponse(moves=moves, source=source)

    if limiter.enabled and hasattr(request.state, "view_rate_limit"):
        limiter._inject_headers(response, request.state.view_rate_limit)

    return result
