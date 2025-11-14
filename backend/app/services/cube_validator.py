"""Validation utilities for Rubik's Cube states."""

from __future__ import annotations

from collections import Counter
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Final

try:
    from kociemba import solve as kociemba_solve
except ImportError:  # pragma: no cover - optional dependency
    kociemba_solve = None  # type: ignore[assignment]

from .solver_local import LocalSolver
from .types import NormalizedCubeState

COLOR_ORDER: Final[tuple[str, ...]] = ("U", "D", "F", "B", "L", "R")
EXPECTED_FACELETS: Final[int] = 54
EXPECTED_COUNT_PER_COLOR: Final[int] = 9
ALLOWED_COLORS: Final[frozenset[str]] = frozenset(COLOR_ORDER)


@dataclass(slots=True)
class CubeValidationError(ValueError):
    """Domain error raised when the cube state is invalid."""

    message_key: str
    context: Mapping[str, object] | None = None

    def __str__(self) -> str:  # pragma: no cover - delegated to localization
        return self.message_key


class CubeValidator:
    """Validate cube facelet strings before solving."""

    def __init__(self, *, local_solver: LocalSolver | None = None) -> None:
        self._local_solver = local_solver

    @staticmethod
    def normalize(state: str) -> NormalizedCubeState:
        return state.strip().upper()

    def validate(self, state: str) -> NormalizedCubeState:
        normalized = self.normalize(state)
        self._validate_length(normalized)
        self._validate_colors(normalized)
        self._validate_distribution(normalized)
        self._validate_reachable(normalized)
        return normalized

    def _validate_length(self, state: NormalizedCubeState) -> None:
        if len(state) != EXPECTED_FACELETS:
            raise CubeValidationError(
                "invalid_length",
                {"expected": EXPECTED_FACELETS, "received": len(state)},
            )

    def _validate_colors(self, state: NormalizedCubeState) -> None:
        unexpected = set(state) - ALLOWED_COLORS
        if unexpected:
            raise CubeValidationError("invalid_colors", {"colors": sorted(unexpected)})

    def _validate_distribution(self, state: NormalizedCubeState) -> None:
        distribution = Counter(state)
        for color in COLOR_ORDER:
            count = distribution.get(color, 0)
            if count != EXPECTED_COUNT_PER_COLOR:
                raise CubeValidationError(
                    "invalid_distribution",
                    {"color": color, "expected": EXPECTED_COUNT_PER_COLOR, "received": count},
                )

    def _validate_reachable(self, state: NormalizedCubeState) -> None:
        solver = self._local_solver
        try:
            if solver is not None:
                solver.solve(state)
            else:  # pragma: no cover - fallback path
                if kociemba_solve is None:
                    raise CubeValidationError(
                        "unsolvable",
                        {"reason": "local solver unavailable"},
                    )
                kociemba_solve(state)
        except ValueError as exc:  # pragma: no cover - depends on invalid input
            raise CubeValidationError("unsolvable", {"reason": str(exc)}) from exc
