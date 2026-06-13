"""Tracked open residual due with grace-period metadata (P08)."""

from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import uuid4

from app.domain.enums import DueStatus
from app.domain.live_ride import reason_label
from app.domain.recovery_policy import RecoveryPolicy


@dataclass
class TrackedOpenDue:
    id: str
    ride_id: str
    rider_id: str
    amount_inr: int
    captured_at_trip_end: int
    reason_codes: list[str]
    status: DueStatus
    created_at: datetime
    estimate_f: int | None = None
    actual_a: int | None = None

    @property
    def reason_label(self) -> str:
        primary = self.reason_codes[0] if self.reason_codes else "unknown_review_required"
        return reason_label(primary)

    def age_days(self, policy: RecoveryPolicy, *, now: datetime | None = None) -> int:
        reference = now or datetime.now(UTC)
        created = self.created_at if self.created_at.tzinfo else self.created_at.replace(tzinfo=UTC)
        return max(0, (reference - created).days)

    def is_past_grace(self, policy: RecoveryPolicy, *, now: datetime | None = None) -> bool:
        return self.age_days(policy, now=now) > policy.grace_period_days

    def days_until_grace_expires(self, policy: RecoveryPolicy, *, now: datetime | None = None) -> int:
        remaining = policy.grace_period_days - self.age_days(policy, now=now)
        return max(0, remaining)


def new_due_id() -> str:
    return f"due_{uuid4().hex[:12]}"
