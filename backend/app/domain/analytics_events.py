"""Analytics event type definitions (P09)."""

from enum import StrEnum


class AnalyticsEventType(StrEnum):
    """Mock event schema for Assured Pay KPI instrumentation."""

    ASSURED_PAY_IMPRESSION = "assured_pay_impression"
    ASSURED_PAY_OPT_IN = "assured_pay_opt_in"
    FARE_ENTERED_BUFFER = "fare_entered_buffer"
    RIDE_AUTO_PAID = "ride_auto_paid"
    CAPTAIN_FULLY_CREDITED = "captain_fully_credited"
    RESIDUAL_DUE_CREATED = "residual_due_created"
    RESIDUAL_DUE_RECOVERED = "residual_due_recovered"
    RESIDUAL_DUE_DISPUTED = "residual_due_disputed"


ALL_EVENT_TYPES: frozenset[str] = frozenset(e.value for e in AnalyticsEventType)
