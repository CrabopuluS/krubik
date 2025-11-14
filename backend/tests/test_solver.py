from __future__ import annotations

import pytest

from app.services import solver


@pytest.mark.parametrize(
    "state, expected_error",
    [
        ("U" * 10, "facelets"),
        ("U" * 54, "Color 'U'"),
        ("U" * 9 + "D" * 9 + "F" * 9 + "B" * 9 + "L" * 9 + "X" * 9, "invalid colors")
    ]
)
def test_verify_state_invalid_inputs(state: str, expected_error: str) -> None:
    with pytest.raises(ValueError) as exc:
        solver.verify_state(state)
    assert expected_error in str(exc.value)


def test_verify_state_valid_state(monkeypatch: pytest.MonkeyPatch) -> None:
    state = (
        "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
    )

    solver._solve_normalized.cache_clear()

    def fake_solve(_: str) -> list[str]:
        return ["R", "U", "R'", "U'"]

    monkeypatch.setattr(solver, "_solve_normalized", lambda _: fake_solve(state))

    solver.verify_state(state)


def test_verify_state_unsolvable(monkeypatch: pytest.MonkeyPatch) -> None:
    state = (
        "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
    )

    solver._solve_normalized.cache_clear()

    def fake_solve(_: str) -> list[str]:
        raise ValueError("Parity error")

    monkeypatch.setattr(solver, "_solve_normalized", lambda _: fake_solve(state))

    with pytest.raises(ValueError) as exc:
        solver.verify_state(state)

    assert "Parity error" in str(exc.value)
