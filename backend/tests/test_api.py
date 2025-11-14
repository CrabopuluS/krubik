from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_solve_success(monkeypatch):
    state = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"

    def fake_verify(_: str) -> None:
        return None

    def fake_solve(_: str) -> list[str]:
        return ["R", "U", "R'", "U'"]

    monkeypatch.setattr("app.main.solver.verify_state", fake_verify)
    monkeypatch.setattr("app.main.solver.solve", fake_solve)

    response = client.post("/solve", json={"state": state})
    assert response.status_code == 200
    assert response.json() == {"moves": ["R", "U", "R'", "U'"]}


def test_solve_invalid_state(monkeypatch):
    def fake_verify(_: str) -> None:
        raise ValueError("invalid")

    monkeypatch.setattr("app.main.solver.verify_state", fake_verify)

    response = client.post("/solve", json={"state": "invalid"})
    assert response.status_code == 422
    assert response.json()["detail"]["error"] == "invalid"
