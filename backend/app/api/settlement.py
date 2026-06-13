"""Settlement execution API (P07)."""

from fastapi import APIRouter, HTTPException

from app.domain.models.payout import CaptainPayoutRecord
from app.domain.models.residual_due import ResidualDueRecord
from app.schemas.common import PlaceholderResponse
from app.schemas.fare import SettlementPreviewRequest, SettlementPreviewResponse
from app.schemas.settlement import (
    CaptainPayoutResponse,
    LedgerEventResponse,
    ResidualDueResponse,
    SettlementExecuteRequest,
    SettlementExecuteResponse,
)
from app.services.fare_engine_service import FareEngineService
from app.services.settlement_service import get_settlement_service
from app.core.config import get_settings

router = APIRouter(tags=["settlement"])


def _to_payout_response(record: CaptainPayoutRecord) -> CaptainPayoutResponse:
    return CaptainPayoutResponse(
        ride_id=record.ride_id,
        captain_id=record.captain_id,
        amount_inr=record.amount_inr,
        state=record.state.value,
        status_label=record.status_label,
        credited_at=record.credited_at.isoformat() if record.credited_at else None,
    )


def _to_residual_response(record: ResidualDueRecord) -> ResidualDueResponse:
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


def _to_execute_response(settlement) -> SettlementExecuteResponse:
    payout = CaptainPayoutRecord.from_payout(settlement.payout)
    residual = (
        _to_residual_response(ResidualDueRecord.from_due(settlement.residual_due))
        if settlement.residual_due
        else None
    )
    return SettlementExecuteResponse(
        settlement_id=settlement.settlement_id,
        ride_id=settlement.ride_id,
        rider_id=settlement.rider_id,
        captain_id=settlement.captain_id,
        estimate_f=settlement.estimate_f,
        approved_m=settlement.approved_m,
        actual_a=settlement.actual_a,
        rider_charged=settlement.rider_charged,
        flow_outcome=settlement.flow_outcome.value,
        settlement_state=settlement.settlement_state.value,
        payout=_to_payout_response(payout),
        residual_due=residual,
        review_case_id=settlement.review_case_id,
        ledger=[
            LedgerEventResponse(
                event_type=e.event_type,
                label=e.label,
                amount_inr=e.amount_inr,
                actor=e.actor,
                timestamp=e.timestamp,
            )
            for e in settlement.ledger
        ],
        policy_version=settlement.policy_version,
    )


@router.get("", response_model=PlaceholderResponse, include_in_schema=False)
def settlement_stub() -> PlaceholderResponse:
    return PlaceholderResponse(module="settlement")


@router.post("/preview", response_model=SettlementPreviewResponse)
def settlement_preview(body: SettlementPreviewRequest) -> SettlementPreviewResponse:
    """Preview end-of-ride settlement given actual fare and reason codes."""
    service = FareEngineService.from_settings(get_settings())
    return service.settlement_preview(
        body.estimate_f,
        body.approved_m,
        body.actual_a,
        body.reason_codes,
    )


@router.post("/execute", response_model=SettlementExecuteResponse)
def settlement_execute(body: SettlementExecuteRequest) -> SettlementExecuteResponse:
    """Execute end-of-ride settlement and persist payout / residual due state."""
    service = get_settlement_service()
    result = service.execute(
        ride_id=body.ride_id,
        rider_id=body.rider_id,
        captain_id=body.captain_id,
        estimate_f=body.estimate_f,
        approved_m=body.approved_m,
        actual_a=body.actual_a,
        reason_codes=body.reason_codes,
    )
    return _to_execute_response(result)


@router.get("/by-ride/{ride_id}", response_model=SettlementExecuteResponse)
def get_settlement_by_ride(ride_id: str) -> SettlementExecuteResponse:
    service = get_settlement_service()
    settlement = service.get_by_ride_id(ride_id)
    if settlement is None:
        raise HTTPException(status_code=404, detail="Settlement not found for ride")
    return _to_execute_response(settlement)


@router.get("/{settlement_id}", response_model=SettlementExecuteResponse)
def get_settlement_by_id(settlement_id: str) -> SettlementExecuteResponse:
    service = get_settlement_service()
    settlement = service.get_by_settlement_id(settlement_id)
    if settlement is None:
        raise HTTPException(status_code=404, detail="Settlement not found")
    return _to_execute_response(settlement)
