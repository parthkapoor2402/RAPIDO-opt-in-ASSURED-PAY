"""Due-state transition tests (P08)."""

from datetime import UTC, datetime, timedelta

import pytest

from app.domain.enums import DueStatus
from app.domain.recovery_policy import RecoveryPolicy
from app.services.residual_due_service import ResidualDueService


@pytest.fixture
def service() -> ResidualDueService:
    return ResidualDueService(RecoveryPolicy())


class TestDueStateTransitions:
    def test_open_to_paid(self, service: ResidualDueService) -> None:
        due = service.register_open_due(
            ride_id="ride_pay",
            rider_id="rider_commuter",
            amount_inr=3,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
        )
        assert due.status == DueStatus.OPEN
        paid = service.pay_due(due.id)
        assert paid.status == DueStatus.PAID
        assert service.get_open_for_rider("rider_commuter") == []

    def test_open_to_disputed(self, service: ResidualDueService) -> None:
        due = service.register_open_due(
            ride_id="ride_disp",
            rider_id="rider_commuter",
            amount_inr=3,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
        )
        disputed = service.mark_disputed(due.id)
        assert disputed.status == DueStatus.DISPUTED

    def test_past_grace_detection(self, service: ResidualDueService) -> None:
        service.register_open_due(
            ride_id="ride_grace",
            rider_id="rider_commuter",
            amount_inr=3,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
            created_at=datetime.now(UTC) - timedelta(days=8),
        )
        open_dues = service.get_open_for_rider("rider_commuter")
        assert len(open_dues) == 1
        assert open_dues[0].is_past_grace(service.policy) is True

    def test_within_grace_not_past_grace(self, service: ResidualDueService) -> None:
        service.register_open_due(
            ride_id="ride_fresh",
            rider_id="rider_commuter",
            amount_inr=3,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
            created_at=datetime.now(UTC) - timedelta(days=2),
        )
        open_dues = service.get_open_for_rider("rider_commuter")
        assert open_dues[0].is_past_grace(service.policy) is False
        assert open_dues[0].days_until_grace_expires(service.policy) == 5
