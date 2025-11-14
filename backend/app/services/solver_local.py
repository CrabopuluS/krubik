"""Local Rubik's Cube solver based on the Kociemba algorithm."""

from __future__ import annotations

from collections.abc import Callable
from functools import lru_cache

import kociemba

from .types import MoveSequence, NormalizedCubeState


class LocalSolver:
    """Solve cube states locally with LRU caching."""

    def __init__(self, cache_size: int = 256) -> None:
        self._solve_cached: Callable[[NormalizedCubeState], MoveSequence] = lru_cache(
            maxsize=cache_size,
        )(self._solve_without_cache)

    @staticmethod
    def _solve_without_cache(state: NormalizedCubeState) -> MoveSequence:
        solution = kociemba.solve(state)
        return tuple(solution.split())

    def solve(self, state: NormalizedCubeState) -> MoveSequence:
        """Return the optimal move sequence for a normalized state."""

        return self._solve_cached(state)
