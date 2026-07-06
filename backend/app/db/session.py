from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# Single async engine for the app process. ``DATABASE_URL`` uses the
# ``postgresql+asyncpg://`` driver (see app.core.config), matching Alembic's
# async migration runner.
engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)

# ``expire_on_commit=False`` keeps ORM objects usable after commit inside a
# request handler, which is the common FastAPI pattern.
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
