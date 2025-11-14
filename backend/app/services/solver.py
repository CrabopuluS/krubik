"""Domain service for solving Rubik's Cube states via the Kociemba algorithm."""

from __future__ import annotations

from collections import Counter
from functools import lru_cache
from typing import Final

import kociemba

COLOR_ORDER: Final[tuple[str, ...]] = ("U", "D", "F", "B", "L", "R")
ALLOWED_COLORS: Final[frozenset[str]] = frozenset(COLOR_ORDER)
EXPECTED_FACELETS: Final[int] = 54
EXPECTED_COUNT_PER_COLOR: Final[int] = 9


def _normalize_state(state: str) -> str:
    """Normalize the state string to uppercase without surrounding whitespace."""
    return state.strip().upper()


@lru_cache(maxsize=128)
def _solve_normalized(state: str) -> list[str]:
    solution = kociemba.solve(state)
    return solution.split()


def solve(state: str) -> list[str]:
    """Solve a cube state using the Kociemba algorithm.

    The solver caches results for repeated states to avoid redundant computations.
    """

    normalized = _normalize_state(state)
    return list(_solve_normalized(normalized))


def verify_state(state: str) -> None:
    """Validate that the cube state contains legal color distribution and is solvable."""

    normalized = _normalize_state(state)
    if len(normalized) != EXPECTED_FACELETS:
        msg = (
            f"Cube state must contain {EXPECTED_FACELETS} facelets; "
            f"received {len(normalized)}."
        )
        raise ValueError(msg)

    unexpected_colors = set(normalized) - ALLOWED_COLORS
    if unexpected_colors:
        msg = f"Cube state contains invalid colors: {sorted(unexpected_colors)}"
        raise ValueError(msg)

    distribution = Counter(normalized)

    for color in COLOR_ORDER:
        count = distribution.get(color, 0)
        if count != EXPECTED_COUNT_PER_COLOR:
            msg = (
                f"Color '{color}' must appear {EXPECTED_COUNT_PER_COLOR} times; "
                f"found {count}."
            )
            raise ValueError(msg)

    try:
        _solve_normalized(normalized)
    except ValueError as exc:
        raise ValueError(str(exc)) from exc
