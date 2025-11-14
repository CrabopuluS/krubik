"""FastAPI application entry point."""

from __future__ import annotations

import os
from typing import Sequence

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .services import solver

load_dotenv()


class SolveRequest(BaseModel):
    """Schema representing a request to solve a cube state."""

    state: str = Field(..., min_length=1, description="Serialized cube state")

    model_config = {
        "json_schema_extra": {
            "example": {
                "state": (
                    "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
                )
            }
        }
    }


class SolveResponse(BaseModel):
    """Schema representing the solver response."""

    moves: list[str]


def _get_cors_origins() -> Sequence[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or ["http://localhost:5173"]


app = FastAPI(title="Krubik Solver", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.post("/solve", response_model=SolveResponse, status_code=status.HTTP_200_OK)
async def solve_cube(payload: SolveRequest) -> SolveResponse:
    """Validate cube state, solve it and return the move sequence."""

    try:
        solver.verify_state(payload.state)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"error": str(exc)}
        ) from exc

    try:
        moves = solver.solve(payload.state)
    except ValueError as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(exc)}
        ) from exc

    return SolveResponse(moves=moves)
