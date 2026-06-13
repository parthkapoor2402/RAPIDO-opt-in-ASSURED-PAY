"""Dispute creation tests (P08)."""

from datetime import UTC, datetime, timedelta

import pytest

from app.domain.recovery_policy import RecoveryPolicy
from app.services.dispute_service import DisputeService
from app.services.residual_due_service import ResidualDueService


@pytest.fixture
def policy() -> RecoveryPolicy:
    return RecoveryPolicy(grace_period_days=7, max_unpaid_before_hard_block=2, dispute_window_hours=24)


@pytest.fixture
def due_service(policy: RecoveryPolicy) -> ResidualDueService:
    return ResidualDueService(policy)


@pytest.fixture
def dispute_service(due_service: ResidualDueService, policy: RecoveryPolicy) -> DisputeService:
    return DisputeService(due_service, policy)


def _seed_open_due(due_service: ResidualDueService) -> str:
    due = due_service.register_open_due(
        ride_id="ride_dispute",
        rider_id="rider_commuter",
        amount_inr=3,
        captured_at_trip_end=49,
        reason_codes=["waiting_after_arrival"],
        created_at=datetime.now(UTC) - timedelta(hours=2),
    )
    return due.id


class TestDisputeCreation:
    def test_create_dispute_for_open_due(self, dispute_service: DisputeService, due_service: ResidualDueService) -> None:
        due_id = _seed_open_due(due_service)
        dispute = dispute_service.create(
            ride_id="ride_dispute",
            rider_id="rider_commuter",
            due_id=due_id,
            reason="I was charged incorrectly for waiting time",
        )
        assert dispute.status == "open"
        assert dispute.ride_id == "ride_dispute"
        stored = due_service.get_by_id(due_id)
        assert stored is not None
        assert stored.status == "disputed"

    def test_dispute_rejected_outside_window(self, dispute_service: DisputeService, due_service: ResidualDueService) -> None:
        due = due_service.register_open_due(
            ride_id="ride_old",
            rider_id="rider_commuter",
            amount_inr=5,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
            created_at=datetime.now(UTC) - timedelta(hours=30),
        )
        with pytest.raises(ValueError, match="dispute window"):
            dispute_service.create(
                ride_id="ride_old",
                rider_id="rider_commuter",
                due_id=due.id,
                reason="Late dispute",
            )

    def test_dispute_requires_open_due(self, dispute_service: DisputeService, due_service: ResidualDueService) -> None:
        due_id = _seed_open_due(due_service)
        due_service.pay_due(due_id)
        with pytest.raises(ValueError, match="not open"):
            dispute_service.create(
                ride_id="ride_dispute",
                rider_id="rider_commuter",
                due_id=due_id,
                reason="Already paid",
            )
