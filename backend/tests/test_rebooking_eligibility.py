"""Rebooking eligibility tests (P08)."""

from datetime import UTC, datetime, timedelta

import pytest

from app.domain.enums import RebookingRestriction
from app.domain.rebooking import evaluate_rebooking
from app.domain.recovery_policy import RecoveryPolicy
from app.services.residual_due_service import ResidualDueService


@pytest.fixture
def policy() -> RecoveryPolicy:
    return RecoveryPolicy(grace_period_days=7, max_unpaid_before_hard_block=2)


@pytest.fixture
def due_service(policy: RecoveryPolicy) -> ResidualDueService:
    return ResidualDueService(policy)


class TestRebookingEligibility:
    def test_no_open_dues_allows_assured_pay(self, policy: RecoveryPolicy) -> None:
        state = evaluate_rebooking([], policy)
        assert state.assured_pay_eligible is True
        assert state.restriction == RebookingRestriction.NONE

    def test_open_due_blocks_assured_pay(self, due_service: ResidualDueService, policy: RecoveryPolicy) -> None:
        due_service.register_open_due(
            ride_id="ride_open",
            rider_id="rider_commuter",
            amount_inr=3,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
            created_at=datetime.now(UTC) - timedelta(days=2),
        )
        open_dues = due_service.get_open_for_rider("rider_commuter")
        state = evaluate_rebooking(open_dues, policy)
        assert state.assured_pay_eligible is False
        assert state.restriction == RebookingRestriction.ASSURED_PAY_BLOCKED
        assert state.grace_active is True

    def test_repeat_unpaid_past_grace_hard_block(self, due_service: ResidualDueService, policy: RecoveryPolicy) -> None:
        for ride in ("ride_a", "ride_b"):
            due_service.register_open_due(
                ride_id=ride,
                rider_id="rider_repeat",
                amount_inr=3,
                captured_at_trip_end=49,
                reason_codes=["waiting_after_arrival"],
                created_at=datetime.now(UTC) - timedelta(days=10),
            )
        open_dues = due_service.get_open_for_rider("rider_repeat")
        state = evaluate_rebooking(open_dues, policy)
        assert state.assured_pay_eligible is False
        assert state.restriction == RebookingRestriction.REPEAT_UNPAID_BLOCKED
        assert state.unpaid_past_grace_count == 2

    def test_standard_rebooking_always_allowed(self, due_service: ResidualDueService, policy: RecoveryPolicy) -> None:
        due_service.register_open_due(
            ride_id="ride_open",
            rider_id="rider_repeat",
            amount_inr=3,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
            created_at=datetime.now(UTC) - timedelta(days=10),
        )
        open_dues = due_service.get_open_for_rider("rider_repeat")
        state = evaluate_rebooking(open_dues, policy)
        assert state.standard_ride_allowed is True
