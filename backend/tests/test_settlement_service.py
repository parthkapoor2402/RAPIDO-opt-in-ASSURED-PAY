"""Settlement state transition and flow outcome tests (P07)."""

import pytest

from app.domain.enums import (
    PayoutState,
    SettlementFlowOutcome,
    SettlementState,
)
from app.domain.policy import SettlementPolicy
from app.services.settlement_service import SettlementService


@pytest.fixture
def policy() -> SettlementPolicy:
    return SettlementPolicy(
        buffer_amount_inr=7,
        small_excess_ceiling_inr=10,
        suspicious_threshold_inr=25,
        policy_version="0.1.0",
    )


@pytest.fixture
def service(policy: SettlementPolicy) -> SettlementService:
    return SettlementService(policy)


class TestHappyPath:
    F, M = 42, 49

    def test_a_below_m_auto_charge_succeeds(self, service: SettlementService) -> None:
        result = service.execute(
            ride_id="ride_happy",
            rider_id="rider_commuter",
            captain_id="captain_ravi",
            estimate_f=self.F,
            approved_m=self.M,
            actual_a=46,
            reason_codes=["waiting_after_arrival"],
        )
        assert result.flow_outcome == SettlementFlowOutcome.HAPPY_PATH
        assert result.settlement_state == SettlementState.COMPLETED
        assert result.payout.state == PayoutState.CREDITED
        assert result.payout.amount_inr == 46
        assert result.residual_due is None
        assert result.rider_charged == 46
        assert result.approved_m == self.M
        assert any(e.event_type == "captain_credited" for e in result.ledger)


class TestValidOverage:
    F, M = 42, 49

    def test_small_valid_creates_residual_captain_fully_credited(
        self, service: SettlementService
    ) -> None:
        result = service.execute(
            ride_id="ride_overage",
            rider_id="rider_commuter",
            captain_id="captain_ravi",
            estimate_f=self.F,
            approved_m=self.M,
            actual_a=52,
            reason_codes=["waiting_after_arrival"],
        )
        assert result.flow_outcome == SettlementFlowOutcome.VALID_OVERAGE
        assert result.settlement_state == SettlementState.RESIDUAL_DUE
        assert result.payout.state == PayoutState.CREDITED
        assert result.payout.amount_inr == 52
        assert result.residual_due is not None
        assert result.residual_due.amount_inr == 3
        assert result.residual_due.status == "open"
        assert result.rider_charged == self.M
        assert any(e.event_type == "residual_created" for e in result.ledger)


class TestSuspiciousOverage:
    F, M = 42, 49

    def test_suspicious_routes_to_review_payout_held(self, service: SettlementService) -> None:
        result = service.execute(
            ride_id="ride_suspicious",
            rider_id="rider_commuter",
            captain_id="captain_ravi",
            estimate_f=self.F,
            approved_m=self.M,
            actual_a=80,
            reason_codes=[],
        )
        assert result.flow_outcome == SettlementFlowOutcome.SUSPICIOUS_OVERAGE
        assert result.settlement_state == SettlementState.REVIEW_REQUIRED
        assert result.payout.state == PayoutState.HELD
        assert result.payout.amount_inr == 80
        assert result.residual_due is None
        assert result.review_case_id is not None
        assert any(e.event_type == "review_queued" for e in result.ledger)


class TestSettlementStore:
    def test_get_by_ride_id_after_execute(self, service: SettlementService) -> None:
        service.execute(
            ride_id="ride_lookup",
            rider_id="rider_commuter",
            captain_id="captain_ravi",
            estimate_f=42,
            approved_m=49,
            actual_a=46,
            reason_codes=[],
        )
        stored = service.get_by_ride_id("ride_lookup")
        assert stored is not None
        assert stored.ride_id == "ride_lookup"
