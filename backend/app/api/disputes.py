"""Dispute creation API (P08)."""

from fastapi import APIRouter, HTTPException

from app.schemas.recovery import DisputeCreateRequest, DisputeResponse
from app.services.dispute_service import get_dispute_service

router = APIRouter(tags=["disputes"])


@router.post("", response_model=DisputeResponse)
def create_dispute(body: DisputeCreateRequest) -> DisputeResponse:
    try:
        dispute = get_dispute_service().create(
            ride_id=body.ride_id,
            rider_id=body.rider_id,
            due_id=body.due_id,
            reason=body.reason,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return DisputeResponse(
        id=dispute.id,
        ride_id=dispute.ride_id,
        rider_id=dispute.rider_id,
        due_id=dispute.due_id,
        reason=dispute.reason,
        status=dispute.status.value,
    )
