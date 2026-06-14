"""Support review case model (P08)."""

from dataclasses import dataclass
from datetime import datetime

from app.domain.enums import ReviewState


@dataclass
class ReviewCase:
    id: str
    ride_id: str
    rider_id: str
    captain_id: str
    approved_m: int
    actual_a: int
    excess_inr: int
    reason_codes: list[str]
    state: ReviewState
    created_at: datetime
    dispute_id: str | None = None
