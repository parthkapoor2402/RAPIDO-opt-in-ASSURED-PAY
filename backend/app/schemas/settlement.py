"""Pydantic schemas for settlement execution API (P07)."""

from pydantic import BaseModel, Field


class SettlementExecuteRequest(BaseModel):
    ride_id: str
    rider_id: str
    captain_id: str
    estimate_f: int = Field(ge=0)
    approved_m: int = Field(ge=0)
    actual_a: int = Field(ge=0)
    reason_codes: list[str] = Field(default_factory=list)


class CaptainPayoutResponse(BaseModel):
    ride_id: str
    captain_id: str
    amount_inr: int
    state: str
    status_label: str
    credited_at: str | None = None


class ResidualDueResponse(BaseModel):
    id: str
    ride_id: str
    rider_id: str
    amount_inr: int
    captured_at_trip_end: int
    reason_codes: list[str]
    reason_label: str
    status: str


class LedgerEventResponse(BaseModel):
    event_type: str
    label: str
    amount_inr: int | None
    actor: str
    timestamp: str


class SettlementExecuteResponse(BaseModel):
    settlement_id: str
    ride_id: str
    rider_id: str
    captain_id: str
    estimate_f: int
    approved_m: int
    actual_a: int
    rider_charged: int
    flow_outcome: str
    settlement_state: str
    payout: CaptainPayoutResponse
    residual_due: ResidualDueResponse | None
    review_case_id: str | None
    ledger: list[LedgerEventResponse]
    policy_version: str
