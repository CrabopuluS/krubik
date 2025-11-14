from __future__ import annotations

import pytest

from app.dependencies import SolverFacade
from app.services.cube_validator import CubeValidationError, CubeValidator
from app.services.solver_local import LocalSolver


class StubSolver(LocalSolver):
    def __init__(self, should_fail: bool = False) -> None:
        super().__init__(cache_size=32)
        self._should_fail = should_fail

    def solve(self, state: str):  # type: ignore[override]
        if self._should_fail:
            raise ValueError('parity error')
        return tuple(state)


def test_validator_length_error() -> None:
    validator = CubeValidator(local_solver=StubSolver())
    with pytest.raises(CubeValidationError) as exc:
        validator.validate('U' * 10)
    assert exc.value.message_key == 'invalid_length'


def test_validator_unsolvable() -> None:
    validator = CubeValidator(local_solver=StubSolver(should_fail=True))
    with pytest.raises(CubeValidationError) as exc:
        validator.validate('UDLRFB' * 9)
    assert exc.value.message_key == 'unsolvable'


@pytest.mark.asyncio
async def test_solver_facade_fallback() -> None:
    class FailingExternal:
        async def solve(self, state: str):
            raise RuntimeError('boom')

    facade = SolverFacade(external_client=FailingExternal(), local_solver=StubSolver())
    moves, source = await facade.solve('UU')
    assert source == 'local'
    assert moves == ['U', 'U']
