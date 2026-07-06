from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    """/health runs SELECT 1 through the async engine.

    Requires a reachable Postgres (CI provides a live service; locally,
    ``docker compose up -d`` is the accepted prerequisite — spec §16).
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
