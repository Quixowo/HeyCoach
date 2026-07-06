from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(unique=True, index=True)
    # "chest" | "back" | "quads" | "hamstrings" | "shoulders" | "arms" | "core" |
    # "glutes" | "calves"
    primary_muscle_group: Mapped[str]
    # "push" | "pull" | "hinge" | "squat" | "carry" | "isolation"
    movement_pattern: Mapped[str]
    # "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight"
    equipment: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
