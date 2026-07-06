from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine

app = FastAPI(title="AI Gym Coach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> JSONResponse:
    """Readiness probe that actually touches the DB.

    The deployed keep-alive ping must reach the database to count as meaningful
    (spec §16), so this runs ``SELECT 1`` through the async engine. Returns 200
    ``{"status": "ok"}`` on success, or 503 ``{"status": "degraded"}`` if the DB
    is unreachable.
    """
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse(status_code=503, content={"status": "degraded"})
    return JSONResponse(status_code=200, content={"status": "ok"})
