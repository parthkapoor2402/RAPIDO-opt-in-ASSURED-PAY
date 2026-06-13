"""Vercel FastAPI entrypoint — re-exports the app from app.main."""

from app.main import app

__all__ = ["app"]
