"""Exhaustive fare engine tests — written before implementation (P04)."""

import pytest

from app.core.config import Settings, get_settings
from app.domain.enums import FareState, OverageClassification, ReasonCode
from app.domain.fare import (
    classify_fare_zone,
    compute_approved_max,
    compute_residual_due,
    round_fare_inr,
)
from app.domain.policy import SettlementPolicy, policy_from_settings
from app.domain.reason_codes import is_auto_residual_reason, normalize_reason_codes
from app.domain.settlement import compute_settlement


@pytest.fixture
def policy() -> SettlementPolicy:
    return SettlementPolicy(
        buffer_amount_inr=7,
        small_excess_ceiling_inr=10,
        suspicious_threshold_inr=25,
        policy_version="0.1.0",
    )


class TestApprovedMaxAndResidual:
    def test_m_equals_f_plus_buffer(self, policy: SettlementPolicy) -> None:
        assert compute_approved_max(42, policy.buffer_amount_inr) == 49

    @pytest.mark.parametrize(
        ("actual", "approved_m", "expected_residual"),
        [
            (40, 49, 0),  # A < F < M
            (42, 49, 0),  # A = F
            (49, 49, 0),  # A = M
            (50, 49, 1),  # A = M + 1
            (59, 49, 10),  # A = M + 10 (small ceiling)
            (75, 49, 26),  # A = M + 26 (suspicious)
        ],
    )
    def test_residual_due(
        self,
        actual: int,
        approved_m: int,
        expected_residual: int,
    ) -> None:
        assert compute_residual_due(actual, approved_m) == expected_residual


class TestFareZone:
    @pytest.mark.parametrize(
        ("current", "estimate_f", "approved_m", "expected"),
        [
            (40, 42, 49, FareState.WITHIN_ESTIMATE),  # A < F
            (42, 42, 49, FareState.WITHIN_ESTIMATE),  # A = F
            (46, 42, 49, FareState.IN_BUFFER),
            (49, 42, 49, FareState.IN_BUFFER),  # A = M
            (50, 42, 49, FareState.EXCEEDS_MAX),  # A = M + 1
        ],
    )
    def test_classify_fare_zone(
        self,
        current: int,
        estimate_f: int,
        approved_m: int,
        expected: FareState,
    ) -> None:
        assert classify_fare_zone(current, estimate_f, approved_m) == expected


class TestOverageClassification:
    estimate_f = 42
    approved_m = 49

    def test_none_when_at_or_below_max(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(
            self.estimate_f,
            self.approved_m,
            42,
            [ReasonCode.WAITING_AFTER_ARRIVAL],
            policy,
        )
        assert result.overage_classification == OverageClassification.NONE
        assert result.residual_due == 0

    def test_none_when_below_estimate(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(self.estimate_f, self.approved_m, 38, [], policy)
        assert result.overage_classification == OverageClassification.NONE

    def test_small_valid_at_m_plus_one_with_valid_reason(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(
            self.estimate_f,
            self.approved_m,
            50,
            [ReasonCode.WAITING_AFTER_ARRIVAL],
            policy,
        )
        assert result.residual_due == 1
        assert result.overage_classification == OverageClassification.SMALL_VALID
        assert result.requires_review is False

    def test_small_valid_at_ceiling_with_valid_reason(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(self.estimate_f, self.approved_m, 59, [ReasonCode.TOLL], policy)
        assert result.residual_due == 10
        assert result.overage_classification == OverageClassification.SMALL_VALID

    def test_suspicious_when_invalid_reason_code(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(
            self.estimate_f, self.approved_m, 50, ["not_a_real_code"], policy
        )
        assert result.overage_classification == OverageClassification.SUSPICIOUS_LARGE
        assert result.requires_review is True

    def test_suspicious_when_unknown_review_required_reason(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(
            self.estimate_f,
            self.approved_m,
            50,
            [ReasonCode.UNKNOWN_REVIEW_REQUIRED],
            policy,
        )
        assert result.overage_classification == OverageClassification.SUSPICIOUS_LARGE
        assert result.requires_review is True

    def test_suspicious_when_no_reason_and_over_max(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(self.estimate_f, self.approved_m, 51, [], policy)
        assert result.overage_classification == OverageClassification.SUSPICIOUS_LARGE

    def test_suspicious_above_threshold_even_with_valid_reason(
        self, policy: SettlementPolicy
    ) -> None:
        result = compute_settlement(
            self.estimate_f,
            self.approved_m,
            75,
            [ReasonCode.RIDER_REQUESTED_ROUTE_CHANGE],
            policy,
        )
        assert result.residual_due == 26
        assert result.overage_classification == OverageClassification.SUSPICIOUS_LARGE
        assert result.requires_review is True

    def test_small_valid_rejected_one_paisa_above_ceiling(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(
            self.estimate_f,
            self.approved_m,
            60,
            [ReasonCode.PICKUP_CORRECTION],
            policy,
        )
        assert result.residual_due == 11
        assert result.overage_classification == OverageClassification.SUSPICIOUS_LARGE


class TestNegativeValueProtection:
    def test_negative_estimate_rejected(self) -> None:
        with pytest.raises(ValueError, match="non-negative"):
            compute_approved_max(-1, 7)

    def test_negative_buffer_rejected(self) -> None:
        with pytest.raises(ValueError, match="non-negative"):
            compute_approved_max(42, -1)

    def test_negative_actual_rejected(self, policy: SettlementPolicy) -> None:
        with pytest.raises(ValueError, match="non-negative"):
            compute_residual_due(-1, 49)

    def test_negative_approved_max_rejected(self) -> None:
        with pytest.raises(ValueError, match="non-negative"):
            compute_residual_due(50, -1)

    def test_settlement_rejects_negative_fare(self, policy: SettlementPolicy) -> None:
        with pytest.raises(ValueError):
            compute_settlement(-1, 49, 50, [], policy)


class TestRoundingBehavior:
    @pytest.mark.parametrize(
        ("amount", "expected"),
        [
            (41.4, 41),
            (41.5, 42),
            (41.51, 42),
            (42.0, 42),
            (0.0, 0),
        ],
    )
    def test_round_fare_inr_half_up(self, amount: float, expected: int) -> None:
        assert round_fare_inr(amount) == expected

    def test_round_fare_inr_rejects_negative(self) -> None:
        with pytest.raises(ValueError):
            round_fare_inr(-0.1)

    def test_settlement_rounds_actual_before_classification(self, policy: SettlementPolicy) -> None:
        result = compute_settlement(42, 49, round_fare_inr(49.6), [], policy)
        assert result.actual_a == 50
        assert result.residual_due == 1


class TestReasonCodeHelpers:
    def test_auto_residual_reasons(self) -> None:
        assert is_auto_residual_reason(ReasonCode.WAITING_AFTER_ARRIVAL) is True
        assert is_auto_residual_reason(ReasonCode.TOLL) is True
        assert is_auto_residual_reason(ReasonCode.UNKNOWN_REVIEW_REQUIRED) is False
        assert is_auto_residual_reason("waiting_after_arrival") is True
        assert is_auto_residual_reason("invalid") is False

    def test_normalize_deduplicates_and_drops_empty(self) -> None:
        codes = normalize_reason_codes(
            ["toll", "toll", "", ReasonCode.WAITING_AFTER_ARRIVAL],
        )
        assert codes == ["toll", ReasonCode.WAITING_AFTER_ARRIVAL.value]


class TestPolicyFromSettings:
    def test_policy_from_settings_defaults(self) -> None:
        settings = Settings()
        policy = policy_from_settings(settings)
        assert policy.buffer_amount_inr == 7
        assert policy.small_excess_ceiling_inr == 10
        assert policy.suspicious_threshold_inr == 25

    def test_policy_env_override(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("BUFFER_AMOUNT_INR", "9")
        monkeypatch.setenv("SMALL_EXCESS_CEILING_INR", "12")
        monkeypatch.setenv("SUSPICIOUS_THRESHOLD_INR", "30")
        get_settings.cache_clear()
        try:
            policy = policy_from_settings(Settings())
            assert policy.buffer_amount_inr == 9
            assert policy.small_excess_ceiling_inr == 12
            assert policy.suspicious_threshold_inr == 30
        finally:
            get_settings.cache_clear()
