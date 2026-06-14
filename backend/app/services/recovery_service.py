"""Next-session recovery state for riders (P08)."""

from app.domain.models.tracked_due import TrackedOpenDue
from app.domain.rebooking import RebookingState
from app.services.residual_due_service import ResidualDueService, get_residual_due_service


class RecoveryService:
    def __init__(self, due_service: ResidualDueService) -> None:
        self._due_service = due_service

    def recovery_state(self, rider_id: str) -> dict:
        open_dues = self._due_service.get_open_for_rider(rider_id)
        disputed = self._due_service.get_disputed_for_rider(rider_id)
        rebooking = self._due_service.rebooking_state(rider_id)
        pending = open_dues + disputed
        total = sum(due.amount_inr for due in pending)

        return {
            "rider_id": rider_id,
            "has_pending_due": len(pending) > 0,
            "pending_amount_inr": total,
            "show_banner": len(open_dues) > 0,
            "open_dues": [self._serialize_due(due) for due in open_dues],
            "disputed_dues": [self._serialize_due(due) for due in disputed],
            "rebooking": self._serialize_rebooking(rebooking),
        }

    def _serialize_due(self, due: TrackedOpenDue) -> dict:
        policy = self._due_service.policy
        return {
            "id": due.id,
            "ride_id": due.ride_id,
            "amount_inr": due.amount_inr,
            "captured_at_trip_end": due.captured_at_trip_end,
            "reason_label": due.reason_label,
            "status": due.status.value,
            "is_past_grace": due.is_past_grace(policy),
            "days_until_grace_expires": due.days_until_grace_expires(policy),
            "estimate_f": due.estimate_f,
            "actual_a": due.actual_a,
        }

    def _serialize_rebooking(self, state: RebookingState) -> dict:
        return {
            "assured_pay_eligible": state.assured_pay_eligible,
            "standard_ride_allowed": state.standard_ride_allowed,
            "restriction": state.restriction.value,
            "grace_active": state.grace_active,
            "unpaid_past_grace_count": state.unpaid_past_grace_count,
            "open_due_count": state.open_due_count,
        }


def get_recovery_service() -> RecoveryService:
    return RecoveryService(get_residual_due_service())
