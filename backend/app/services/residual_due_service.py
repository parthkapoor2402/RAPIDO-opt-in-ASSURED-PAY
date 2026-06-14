"""Residual due lifecycle service (P08)."""

from datetime import UTC, datetime

from app.core.config import Settings, get_settings
from app.domain.enums import DueStatus
from app.domain.models.tracked_due import TrackedOpenDue, new_due_id
from app.domain.rebooking import RebookingState, evaluate_rebooking
from app.domain.recovery_policy import RecoveryPolicy


class ResidualDueService:
    def __init__(self, policy: RecoveryPolicy) -> None:
        self._policy = policy
        self._by_id: dict[str, TrackedOpenDue] = {}
        self._by_ride_id: dict[str, str] = {}

    @classmethod
    def from_settings(cls, settings: Settings | None = None) -> "ResidualDueService":
        cfg = settings or get_settings()
        policy = RecoveryPolicy(
            grace_period_days=cfg.grace_period_days,
            max_unpaid_before_hard_block=cfg.max_unpaid_before_hard_block,
            dispute_window_hours=cfg.dispute_window_hours,
        )
        return cls(policy)

    @property
    def policy(self) -> RecoveryPolicy:
        return self._policy

    def register_open_due(
        self,
        *,
        ride_id: str,
        rider_id: str,
        amount_inr: int,
        captured_at_trip_end: int,
        reason_codes: list[str],
        created_at: datetime | None = None,
        estimate_f: int | None = None,
        actual_a: int | None = None,
        due_id: str | None = None,
    ) -> TrackedOpenDue:
        due = TrackedOpenDue(
            id=due_id or new_due_id(),
            ride_id=ride_id,
            rider_id=rider_id,
            amount_inr=amount_inr,
            captured_at_trip_end=captured_at_trip_end,
            reason_codes=reason_codes,
            status=DueStatus.OPEN,
            created_at=created_at or datetime.now(UTC),
            estimate_f=estimate_f,
            actual_a=actual_a,
        )
        self._by_id[due.id] = due
        self._by_ride_id[ride_id] = due.id
        return due

    def get_by_id(self, due_id: str) -> TrackedOpenDue | None:
        return self._by_id.get(due_id)

    def get_by_ride_id(self, ride_id: str) -> TrackedOpenDue | None:
        due_id = self._by_ride_id.get(ride_id)
        return self._by_id.get(due_id) if due_id else None

    def get_open_for_rider(self, rider_id: str) -> list[TrackedOpenDue]:
        return [
            due
            for due in self._by_id.values()
            if due.rider_id == rider_id and due.status == DueStatus.OPEN
        ]

    def get_disputed_for_rider(self, rider_id: str) -> list[TrackedOpenDue]:
        return [
            due
            for due in self._by_id.values()
            if due.rider_id == rider_id and due.status == DueStatus.DISPUTED
        ]

    def pay_due(self, due_id: str) -> TrackedOpenDue:
        due = self._require_due(due_id)
        if due.status not in {DueStatus.OPEN, DueStatus.DISPUTED}:
            raise ValueError("due is not open")
        due.status = DueStatus.PAID
        return due

    def mark_disputed(self, due_id: str) -> TrackedOpenDue:
        due = self._require_due(due_id)
        if due.status != DueStatus.OPEN:
            raise ValueError("due is not open")
        due.status = DueStatus.DISPUTED
        return due

    def rebooking_state(self, rider_id: str) -> RebookingState:
        open_dues = self.get_open_for_rider(rider_id)
        return evaluate_rebooking(open_dues, self._policy)

    def _require_due(self, due_id: str) -> TrackedOpenDue:
        due = self._by_id.get(due_id)
        if due is None:
            raise ValueError("due not found")
        return due


_default_service: ResidualDueService | None = None
_demo_seeded = False


def _seed_demo_dues(service: ResidualDueService) -> None:
    global _demo_seeded
    if _demo_seeded:
        return
    from datetime import UTC, datetime, timedelta

    if not service.get_open_for_rider("rider_blocked"):
        service.register_open_due(
            ride_id="ride_blocked_demo",
            rider_id="rider_blocked",
            amount_inr=3,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
            created_at=datetime.now(UTC) - timedelta(days=3),
            estimate_f=42,
            actual_a=52,
        )
    _demo_seeded = True


def get_residual_due_service() -> ResidualDueService:
    global _default_service
    if _default_service is None:
        _default_service = ResidualDueService.from_settings()
        _seed_demo_dues(_default_service)
    return _default_service
