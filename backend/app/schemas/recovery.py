"""Recovery, dispute, and support schemas (P08)."""

from pydantic import BaseModel, Field


class OpenDueResponse(BaseModel):
    id: str
    ride_id: str
    amount_inr: int
    captured_at_trip_end: int
    reason_label: str
    status: str
    is_past_grace: bool
    days_until_grace_expires: int
    estimate_f: int | None = None
    actual_a: int | None = None


class RebookingStateResponse(BaseModel):
    assured_pay_eligible: bool
    standard_ride_allowed: bool
    restriction: str
    grace_active: bool
    unpaid_past_grace_count: int
    open_due_count: int


class RecoveryStateResponse(BaseModel):
    rider_id: str
    has_pending_due: bool
    pending_amount_inr: int
    show_banner: bool
    open_dues: list[OpenDueResponse]
    disputed_dues: list[OpenDueResponse]
    rebooking: RebookingStateResponse


class PayDueResponse(BaseModel):
    id: str
    ride_id: str
    amount_inr: int
    status: str
    message: str


class DisputeCreateRequest(BaseModel):
    ride_id: str
    rider_id: str
    due_id: str
    reason: str = Field(min_length=5)


class DisputeResponse(BaseModel):
    id: str
    ride_id: str
    rider_id: str
    due_id: str
    reason: str
    status: str


class ReviewCaseResponse(BaseModel):
    id: str
    ride_id: str
    rider_id: str
    captain_id: str
    approved_m: int
    actual_a: int
    excess_inr: int
    reason_codes: list[str]
    state: str


class ReviewQueueResponse(BaseModel):
    cases: list[ReviewCaseResponse]
    pending_count: int


class ReviewResolveRequest(BaseModel):
    resolution: str = Field(min_length=3)
