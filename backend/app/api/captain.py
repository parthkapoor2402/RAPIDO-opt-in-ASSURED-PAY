"""Captain payout API (P07)."""

from fastapi import APIRouter, HTTPException

from app.domain.models.payout import CaptainPayoutRecord
from app.schemas.settlement import CaptainPayoutResponse
from app.services.settlement_service import get_settlement_service

router = APIRouter(tags=["captain"])


@router.get("/payouts/{ride_id}", response_model=CaptainPayoutResponse)
def get_captain_payout(ride_id: str) -> CaptainPayoutResponse:
    settlement = get_settlement_service().get_by_ride_id(ride_id)
    if settlement is None:
        raise HTTPException(status_code=404, detail="Payout not found for ride")
    record = CaptainPayoutRecord.from_payout(settlement.payout)
    return CaptainPayoutResponse(
        ride_id=record.ride_id,
        captain_id=record.captain_id,
        amount_inr=record.amount_inr,
        state=record.state.value,
        status_label=record.status_label,
        credited_at=record.credited_at.isoformat() if record.credited_at else None,
    )
