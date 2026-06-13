"""Analytics API schemas (P09)."""

from pydantic import BaseModel, Field


class AnalyticsEventResponse(BaseModel):
    event_type: str
    ride_id: str | None
    rider_id: str | None
    amount_inr: int | None
    scenario: str
    timestamp: str


class AnalyticsEventListResponse(BaseModel):
    events: list[AnalyticsEventResponse]
    total: int


class AnalyticsSummaryResponse(BaseModel):
    scenario: str
    frictionless_completion_rate: float = Field(description="North Star FACR %")
    captain_payout_success_rate: float
    residual_recovery_rate: float
    dispute_rate: float
    bad_debt_estimate_inr: int
    repeat_assured_pay_usage_rate: float
    opt_in_rate: float
    assured_rides_completed: int
    event_counts: dict[str, int]
    story_headline: str
    story_subline: str
