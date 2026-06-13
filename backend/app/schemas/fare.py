"""Pydantic schemas for fare engine API (P04)."""

from pydantic import BaseModel, Field


class BookingEstimateRequest(BaseModel):
    estimate_f: int = Field(default=42, ge=0, description="Estimated fare F in INR")


class BookingEstimateResponse(BaseModel):
    F: int
    buffer: int
    M: int
    policy_version: str


class FarePreviewRequest(BaseModel):
    estimate_f: int = Field(ge=0)
    approved_m: int = Field(ge=0)
    current_fare: int = Field(ge=0)


class FarePreviewResponse(BaseModel):
    estimate_f: int
    approved_m: int
    current_fare: int
    fare_state: str
    residual_due_if_ended_now: int


class FareReasonUpdateResponse(BaseModel):
    time_label: str
    amount_inr: int
    delta_inr: int
    reason_code: str
    reason_label: str


class RideProgressResponse(BaseModel):
    estimate_f: int
    approved_m: int
    buffer: int
    current_fare: int
    fare_state: str
    trust_state: str
    residual_due_if_ended_now: int
    requires_review_if_ended_now: bool
    assured_pay_active: bool
    reason_updates: list[FareReasonUpdateResponse]
    latest_reason_code: str | None = None
    policy_version: str


class RideScenarioSummary(BaseModel):
    id: str
    label: str
    description: str
    step_count: int


class RideScenarioListResponse(BaseModel):
    scenarios: list[RideScenarioSummary]


class SettlementPreviewRequest(BaseModel):
    estimate_f: int = Field(ge=0)
    approved_m: int = Field(ge=0)
    actual_a: int = Field(ge=0)
    reason_codes: list[str] = Field(default_factory=list)


class SettlementPreviewResponse(BaseModel):
    F: int
    M: int
    A: int
    buffer: int
    residual_due: int
    overage_classification: str
    rider_charge_at_capture: int
    captain_payout: int
    requires_review: bool
    reason_codes: list[str]
    policy_version: str
