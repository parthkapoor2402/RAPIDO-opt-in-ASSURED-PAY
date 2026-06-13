"""Analytics API (P09)."""

from fastapi import APIRouter, Query

from app.schemas.analytics import AnalyticsEventListResponse, AnalyticsEventResponse, AnalyticsSummaryResponse
from app.schemas.common import PlaceholderResponse
from app.services.analytics_service import get_analytics_service

router = APIRouter(tags=["analytics"])


@router.get("", response_model=PlaceholderResponse, include_in_schema=False)
def analytics_stub() -> PlaceholderResponse:
    return PlaceholderResponse(module="analytics")


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def analytics_summary(
    scenario: str = Query(default="all", pattern="^(all|healthy|stressed)$"),
) -> AnalyticsSummaryResponse:
    summary = get_analytics_service().get_summary(scenario)
    return AnalyticsSummaryResponse(
        scenario=summary.scenario,
        frictionless_completion_rate=summary.frictionless_completion_rate,
        captain_payout_success_rate=summary.captain_payout_success_rate,
        residual_recovery_rate=summary.residual_recovery_rate,
        dispute_rate=summary.dispute_rate,
        bad_debt_estimate_inr=summary.bad_debt_estimate_inr,
        repeat_assured_pay_usage_rate=summary.repeat_assured_pay_usage_rate,
        opt_in_rate=summary.opt_in_rate,
        assured_rides_completed=summary.assured_rides_completed,
        event_counts=summary.event_counts,
        story_headline=summary.story_headline,
        story_subline=summary.story_subline,
    )


@router.get("/events", response_model=AnalyticsEventListResponse)
def analytics_events(
    scenario: str = Query(default="all", pattern="^(all|healthy|stressed)$"),
) -> AnalyticsEventListResponse:
    events = get_analytics_service().list_events(scenario)
    responses = [
        AnalyticsEventResponse(
            event_type=e.event_type,
            ride_id=e.ride_id,
            rider_id=e.rider_id,
            amount_inr=e.amount_inr,
            scenario=e.scenario,
            timestamp=e.timestamp,
        )
        for e in events
    ]
    return AnalyticsEventListResponse(events=responses, total=len(responses))
