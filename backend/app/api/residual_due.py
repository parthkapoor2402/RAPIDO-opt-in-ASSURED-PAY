"""Residual due API (P07/P08)."""

from fastapi import APIRouter, HTTPException

from app.domain.models.residual_due import ResidualDueRecord
from app.schemas.recovery import PayDueResponse
from app.schemas.settlement import ResidualDueResponse
from app.services.residual_due_service import get_residual_due_service
from app.services.settlement_service import get_settlement_service

router = APIRouter(tags=["residual-due"])


@router.get("/by-ride/{ride_id}", response_model=ResidualDueResponse)
def get_residual_due_by_ride(ride_id: str) -> ResidualDueResponse:
    tracked = get_residual_due_service().get_by_ride_id(ride_id)
    if tracked is not None:
        return ResidualDueResponse(
            id=tracked.id,
            ride_id=tracked.ride_id,
            rider_id=tracked.rider_id,
            amount_inr=tracked.amount_inr,
            captured_at_trip_end=tracked.captured_at_trip_end,
            reason_codes=tracked.reason_codes,
            reason_label=tracked.reason_label,
            status=tracked.status.value,
        )
    settlement = get_settlement_service().get_by_ride_id(ride_id)
    if settlement is None or settlement.residual_due is None:
        raise HTTPException(status_code=404, detail="Residual due not found for ride")
    record = ResidualDueRecord.from_due(settlement.residual_due)
    return ResidualDueResponse(
        id=record.id,
        ride_id=record.ride_id,
        rider_id=record.rider_id,
        amount_inr=record.amount_inr,
        captured_at_trip_end=record.captured_at_trip_end,
        reason_codes=record.reason_codes,
        reason_label=record.reason_label,
        status=record.status,
    )


@router.post("/{due_id}/pay", response_model=PayDueResponse)
def pay_residual_due(due_id: str) -> PayDueResponse:
    try:
        due = get_residual_due_service().pay_due(due_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return PayDueResponse(
        id=due.id,
        ride_id=due.ride_id,
        amount_inr=due.amount_inr,
        status=due.status.value,
        message="Payment received. Your due is cleared.",
    )
