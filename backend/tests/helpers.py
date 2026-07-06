"""Shared helpers for the Phase 3a route tests.

A registered user's cookies live in the shared session-scoped ``TestClient``
jar. Because multiple tests (and both users A and B in the access-control checks)
share one client, tests that need a specific authenticated identity call
``register_user`` to (re)establish whose cookies are active, then act. The
``authed_client`` context manager makes "act as this user" explicit and restores
the previous jar afterwards.
"""

from __future__ import annotations

import contextlib
import uuid
from collections.abc import Iterator

from fastapi.testclient import TestClient


def unique_email() -> str:
    return f"user_{uuid.uuid4().hex}@example.com"


def register_payload(email: str | None = None, password: str = "password123") -> dict:
    return {
        "email": email or unique_email(),
        "password": password,
        "display_name": "Test Lifter",
        "experience_level": "intermediate",
        "primary_goal": "hypertrophy",
        "injury_notes": None,
    }


def register_user(client: TestClient, email: str | None = None) -> dict:
    """Register a fresh user; leaves only that user's auth cookies active on ``client``.

    Clears the jar first so the register response's Set-Cookie is the only
    ``access_token`` present (httpx2 raises ``CookieConflict`` on duplicate names,
    which happens when tests register A then B on the shared client).

    Returns the created user's profile body (includes ``id``).
    """
    client.cookies.clear()
    payload = register_payload(email=email)
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


def login_user(client: TestClient, email: str, password: str = "password123") -> None:
    """Log a user in, making their cookies the active ones on ``client``."""
    resp = client.post("/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text


@contextlib.contextmanager
def authed_client(
    client: TestClient, email: str, password: str = "password123"
) -> Iterator[TestClient]:
    """Temporarily act as ``email`` on the shared client, leaving a clean jar after.

    Clears the jar before logging in (so the login's Set-Cookie is the only
    ``access_token`` present — httpx2 raises ``CookieConflict`` if two cookies
    share a name) and clears it again on exit, so no stale identity leaks into the
    next test.
    """
    client.cookies.clear()
    login_user(client, email, password)
    try:
        yield client
    finally:
        client.cookies.clear()


def get_exercise_ids(client: TestClient, count: int = 2) -> list[str]:
    """Return ``count`` real exercise ids from the seeded catalog (auth required)."""
    resp = client.get("/exercises")
    assert resp.status_code == 200, resp.text
    exercises = resp.json()
    assert len(exercises) >= count, "seeded catalog too small for this test"
    return [e["id"] for e in exercises[:count]]
