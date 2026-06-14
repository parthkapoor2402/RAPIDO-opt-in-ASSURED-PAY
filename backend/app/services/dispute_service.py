"""Dispute creation service (P08)."""

from datetime import UTC, datetime, timedelta

from app.domain.enums import DisputeStatus, DueStatus
from app.domain.models.dispute import Dispute, new_dispute_id
from app.domain.recovery_policy import RecoveryPolicy
from app.services.residual_due_service import ResidualDueService, get_residual_due_service


class DisputeService:
    def __init__(self, due_service: ResidualDueService, policy: RecoveryPolicy) -> None:
        self._due_service = due_service
        self._policy = policy
        self._disputes: dict[str, Dispute] = {}

    def create(
        self,
        *,
        ride_id: str,
        rider_id: str,
        due_id: str,
        reason: str,
    ) -> Dispute:
        due = self._due_service.get_by_id(due_id)
        if due is None:
            raise ValueError("due not found")
        if due.ride_id != ride_id or due.rider_id != rider_id:
            raise ValueError("due mismatch")
        if due.status != DueStatus.OPEN:
            raise ValueError("due is not open")

        created_at = due.created_at if due.created_at.tzinfo else due.created_at.replace(tzinfo=UTC)
        window_end = created_at + timedelta(hours=self._policy.dispute_window_hours)
        if datetime.now(UTC) > window_end:
            raise ValueError("dispute window expired")

        self._due_service.mark_disputed(due_id)
        dispute = Dispute(
            id=new_dispute_id(),
            ride_id=ride_id,
            rider_id=rider_id,
            due_id=due_id,
            reason=reason.strip(),
            status=DisputeStatus.OPEN,
            created_at=datetime.now(UTC),
        )
        self._disputes[dispute.id] = dispute
        return dispute

    def get_by_id(self, dispute_id: str) -> Dispute | None:
        return self._disputes.get(dispute_id)

    def list_for_rider(self, rider_id: str) -> list[Dispute]:
        return [d for d in self._disputes.values() if d.rider_id == rider_id]


_default_service: DisputeService | None = None


def get_dispute_service() -> DisputeService:
    global _default_service
    due_service = get_residual_due_service()
    if _default_service is None:
        _default_service = DisputeService(due_service, due_service.policy)
    return _default_service
