"""Analytics event record model (P09)."""

from dataclasses import dataclass
from datetime import UTC, datetime


@dataclass(frozen=True)
class AnalyticsEvent:
    event_type: str
    ride_id: str | None
    rider_id: str | None
    amount_inr: int | None
    scenario: str
    timestamp: str
    metadata: dict[str, str | int | float | bool | None]
