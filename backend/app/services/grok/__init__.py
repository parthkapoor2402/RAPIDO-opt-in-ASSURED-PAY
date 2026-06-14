"""Grok assist service package (P14)."""

from app.services.grok.explanation_service import (
    ExplanationResult,
    ExplanationService,
    get_explanation_service,
)

__all__ = ["ExplanationResult", "ExplanationService", "get_explanation_service"]
