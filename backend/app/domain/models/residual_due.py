"""Residual due model for valid small overages."""

from dataclasses import dataclass
from uuid import uuid4

from app.domain.live_ride import reason_label


@dataclass(frozen=True)
class ResidualDue:
    id: str
    ride_id: str
    rider_id: str
    amount_inr: int
    captured_at_trip_end: int
    reason_codes: list[str]
    status: str


@dataclass(frozen=True)
class ResidualDueRecord:
    id: str
    ride_id: str
    rider_id: str
    amount_inr: int
    captured_at_trip_end: int
    reason_codes: list[str]
    reason_label: str
    status: str

    @classmethod
    def from_due(cls, due: ResidualDue) -> "ResidualDueRecord":
        primary = due.reason_codes[0] if due.reason_codes else "unknown_review_required"
        return cls(
            id=due.id,
            ride_id=due.ride_id,
            rider_id=due.rider_id,
            amount_inr=due.amount_inr,
            captured_at_trip_end=due.captured_at_trip_end,
            reason_codes=due.reason_codes,
            reason_label=reason_label(primary),
            status=due.status,
        )


def create_residual_due(
    *,
    ride_id: str,
    rider_id: str,
    approved_m: int,
    actual_a: int,
    reason_codes: list[str],
) -> ResidualDue:
    return ResidualDue(
        id=f"due_{uuid4().hex[:12]}",
        ride_id=ride_id,
        rider_id=rider_id,
        amount_inr=actual_a - approved_m,
        captured_at_trip_end=approved_m,
        reason_codes=reason_codes,
        status="open",
    )
