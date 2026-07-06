from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession]:
    """FastAPI dependency yielding a request-scoped async DB session.

    The session is closed when the request finishes. ``get_current_user`` (which
    injects the verified-JWT user into service/tool calls, per CLAUDE.md rule 2)
    arrives in Phase 2.
    """
    async with async_session_maker() as session:
        yield session
