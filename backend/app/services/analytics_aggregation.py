"""KPI aggregation helpers (P09)."""

from dataclasses import dataclass

from app.domain.analytics_events import AnalyticsEventType


@dataclass(frozen=True)
class KpiSummary:
    scenario: str
    frictionless_completion_rate: float
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


def _count(events: list[dict], event_type: AnalyticsEventType) -> int:
    return sum(1 for e in events if e.get("event_type") == event_type.value)


def _pct(numerator: int, denominator: int) -> float:
    if denominator == 0:
        return 0.0
    return round(numerator / denominator * 100, 1)


def compute_kpi_summary(events: list[dict], *, scenario: str = "all") -> KpiSummary:
    """Aggregate KPI metrics from a list of event dicts."""
    impressions = _count(events, AnalyticsEventType.ASSURED_PAY_IMPRESSION)
    opt_ins = _count(events, AnalyticsEventType.ASSURED_PAY_OPT_IN)
    auto_paid = _count(events, AnalyticsEventType.RIDE_AUTO_PAID)
    residuals_created = _count(events, AnalyticsEventType.RESIDUAL_DUE_CREATED)
    residuals_recovered = _count(events, AnalyticsEventType.RESIDUAL_DUE_RECOVERED)
    residuals_disputed = _count(events, AnalyticsEventType.RESIDUAL_DUE_DISPUTED)
    captain_credited = _count(events, AnalyticsEventType.CAPTAIN_FULLY_CREDITED)

    completed = auto_paid + residuals_created
    frictionless = auto_paid
    facr = _pct(frictionless, completed) if completed else 0.0

    payout_attempts = captain_credited + residuals_disputed
    payout_success = _pct(captain_credited, payout_attempts) if payout_attempts else 100.0

    recovery_rate = _pct(residuals_recovered, residuals_created) if residuals_created else 100.0
    dispute_rate = _pct(residuals_disputed, residuals_created) if residuals_created else 0.0

    unrecovered = max(0, residuals_created - residuals_recovered - residuals_disputed)
    avg_residual = 3
    bad_debt = unrecovered * avg_residual

    rider_opt_ins = {e.get("rider_id") for e in events if e.get("event_type") == AnalyticsEventType.ASSURED_PAY_OPT_IN.value}
    repeat_riders = sum(
        1
        for rider_id in rider_opt_ins
        if rider_id
        and sum(
            1
            for e in events
            if e.get("rider_id") == rider_id
            and e.get("event_type") == AnalyticsEventType.ASSURED_PAY_OPT_IN.value
        )
        >= 2
    )
    repeat_rate = _pct(repeat_riders, len(rider_opt_ins)) if rider_opt_ins else 0.0

    opt_in_rate = _pct(opt_ins, impressions) if impressions else 0.0

    event_counts = {t.value: _count(events, t) for t in AnalyticsEventType}

    if facr >= 90 and dispute_rate <= 5:
        headline = "Assured Pay is working — riders finish without payment stress"
        subline = "High frictionless completion with captain payouts protected and low dispute volume."
    elif dispute_rate > 10:
        headline = "Recovery attention needed — dispute rate elevated"
        subline = "Review fare-change communication and residual recovery UX for stressed cohorts."
    else:
        headline = "Solid baseline — room to improve residual recovery"
        subline = "Most rides complete frictionlessly; focus on clearing small dues faster."

    return KpiSummary(
        scenario=scenario,
        frictionless_completion_rate=facr,
        captain_payout_success_rate=payout_success,
        residual_recovery_rate=recovery_rate,
        dispute_rate=dispute_rate,
        bad_debt_estimate_inr=bad_debt,
        repeat_assured_pay_usage_rate=repeat_rate,
        opt_in_rate=opt_in_rate,
        assured_rides_completed=completed,
        event_counts=event_counts,
        story_headline=headline,
        story_subline=subline,
    )
