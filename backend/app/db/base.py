from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative base for all ORM models.

    All model classes inherit from this so that ``Base.metadata`` reflects the
    full schema — Alembic autogenerate relies on every model being imported (see
    ``app/models/__init__.py``).
    """
