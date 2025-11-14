from __future__ import annotations

from collections.abc import Iterator
from http import HTTPStatus
from typing import Any
from uuid import uuid4

import pytest
from app.dependencies import SolverFacade, get_cube_validator, get_solver_facade
from app.main import app
from app.services.cube_validator import CubeValidationError, CubeValidator
from fastapi.testclient import TestClient


class DummyValidator(CubeValidator):
    def __init__(self) -> None:
        super().__init__(local_solver=None)

    def validate(self, state: str) -> str:  # type: ignore[override]
        if state == 'bad':
            raise CubeValidationError('invalid_length', {'expected': 54, 'received': 3})
        return state.upper()


class DummySolverFacade(SolverFacade):
    def __init__(self, moves: list[str], source: str) -> None:
        self._moves = moves
        self._source = source

    async def solve(self, state: str) -> tuple[list[str], str]:  # type: ignore[override]
        return self._moves, self._source


@pytest.fixture(autouse=True)
def override_dependencies() -> Iterator[None]:
    get_cube_validator.cache_clear()
    app.dependency_overrides[get_cube_validator] = DummyValidator
    app.dependency_overrides[get_solver_facade] = lambda: DummySolverFacade(['R', 'U'], 'external')
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as client:
        csrf_token = uuid4().hex
        client.cookies.set('csrf_token', csrf_token)
        client.headers.update({'X-CSRF-Token': csrf_token, 'Accept-Language': 'ru'})
        yield client


def test_solve_success(client: TestClient) -> None:
    response = client.post('/solve', json={'state': 'uuu'})
    assert response.status_code == HTTPStatus.OK
    body: dict[str, Any] = response.json()
    assert body['moves'] == ['R', 'U']
    assert body['source'] == 'external'


def test_solve_validation_error_translated(client: TestClient) -> None:
    response = client.post('/solve', json={'state': 'bad'})
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    detail = response.json()['detail']
    assert detail['code'] == 'invalid_length'
    assert 'стикеров' in detail['message']


def test_csrf_protection() -> None:
    with TestClient(app) as client:
        response = client.post('/solve', json={'state': 'uuu'})
    assert response.status_code == HTTPStatus.FORBIDDEN
    detail = response.json()['detail']
    assert detail['code'] == 'invalid_csrf'
