"""Assistive explanation API — Grok optional (P14)."""

from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.assist import (
    AssistStatusResponse,
    DisputeExplainRequest,
    DueExplainRequest,
    ExplanationResponse,
    FareExplainRequest,
)
from app.services.grok.explanation_service import get_explanation_service

router = APIRouter(tags=["assist"])


def _to_response(result) -> ExplanationResponse:
    return ExplanationResponse(
        text=result.text,
        source=result.source,
        use_case=result.use_case,
        grok_available=result.grok_available,
    )


@router.get("/status", response_model=AssistStatusResponse)
def assist_status() -> AssistStatusResponse:
    settings = get_settings()
    service = get_explanation_service()
    enabled = settings.grok_copy_enabled
    configured = service.grok_available
    if configured:
        message = "Grok assist is on for explanations only — settlement stays rule-based."
    elif enabled:
        message = "Grok is enabled but no API key is set — using policy summaries."
    else:
        message = "Grok is off — app uses built-in policy summaries."
    return AssistStatusResponse(
        grok_enabled=enabled,
        grok_configured=configured,
        message=message,
    )


@router.post("/explain/fare", response_model=ExplanationResponse)
def explain_fare(body: FareExplainRequest) -> ExplanationResponse:
    result = get_explanation_service().explain_fare_change(
        estimate_f=body.estimate_f,
        approved_m=body.approved_m,
        buffer=body.buffer,
        current_fare=body.current_fare,
        reason_label=body.reason_label,
    )
    return _to_response(result)


@router.post("/explain/due", response_model=ExplanationResponse)
def explain_due(body: DueExplainRequest) -> ExplanationResponse:
    result = get_explanation_service().explain_pending_due(
        amount_inr=body.amount_inr,
        approved_m=body.approved_m,
        actual_a=body.actual_a,
        reason_label=body.reason_label,
    )
    return _to_response(result)


@router.post("/explain/dispute", response_model=ExplanationResponse)
def explain_dispute(body: DisputeExplainRequest) -> ExplanationResponse:
    result = get_explanation_service().explain_dispute_summary(
        ride_id=body.ride_id,
        approved_m=body.approved_m,
        actual_a=body.actual_a,
        excess_inr=body.excess_inr,
        reason_codes=body.reason_codes,
        rider_note=body.rider_note,
    )
    return _to_response(result)
