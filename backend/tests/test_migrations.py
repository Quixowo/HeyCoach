"""Migration integration test.

Programmatically runs ``alembic upgrade head`` against ``settings.DATABASE_URL``,
then asserts the resulting schema: all six domain tables exist, the ``vector``
extension is installed, and both special indexes are present.

Never drops anything and is idempotent — ``upgrade head`` is a no-op when the DB
is already at head, and the extension/index CREATEs in the migration are
``IF NOT EXISTS``-safe. Requires a reachable Postgres (CI service / local
``docker compose up -d``).

This test is deliberately synchronous. Alembic's async ``env.py`` calls
``asyncio.run()`` internally, which would raise "event loop already running" if
this test were itself run inside pytest-asyncio's loop. So ``command.upgrade``
runs at module-sync level, and the verification queries use their own isolated
``asyncio.run``.
"""

from __future__ import annotations

import asyncio
from pathlib import Path

from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import command
from app.core.config import settings

BACKEND_DIR = Path(__file__).resolve().parents[1]

EXPECTED_TABLES = {
    "users",
    "exercises",
    "programs",
    "program_exercises",
    "workout_sessions",
    "set_entries",
    "knowledge_chunks",
}

EXPECTED_INDEXES = {
    "ix_knowledge_chunks_embedding",
    "ix_set_entries_user_exercise_created",
}


def _alembic_config() -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    # env.py injects sqlalchemy.url from settings, so no override needed here.
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    return cfg


async def _collect_schema() -> tuple[set[str], int | None, set[str]]:
    engine = create_async_engine(settings.DATABASE_URL)
    try:
        async with engine.connect() as conn:
            tables = set(
                (
                    await conn.execute(
                        text(
                            "SELECT table_name FROM information_schema.tables "
                            "WHERE table_schema = 'public'"
                        )
                    )
                )
                .scalars()
                .all()
            )
            has_vector = (
                await conn.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'"))
            ).scalar_one_or_none()
            indexes = set(
                (
                    await conn.execute(
                        text("SELECT indexname FROM pg_indexes WHERE schemaname = 'public'")
                    )
                )
                .scalars()
                .all()
            )
        return tables, has_vector, indexes
    finally:
        await engine.dispose()


def test_migration_upgrade_head_builds_schema() -> None:
    # Idempotent: a no-op if the DB is already at head.
    command.upgrade(_alembic_config(), "head")

    tables, has_vector, indexes = asyncio.run(_collect_schema())

    assert EXPECTED_TABLES <= tables, f"missing tables: {EXPECTED_TABLES - tables}"
    assert has_vector == 1, "vector extension not installed"
    assert EXPECTED_INDEXES <= indexes, f"missing indexes: {EXPECTED_INDEXES - indexes}"
