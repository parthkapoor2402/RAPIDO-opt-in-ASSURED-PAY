"""Deterministic settlement computation (P04)."""

from dataclasses import dataclass

from app.domain.enums import OverageClassification, ReasonCode
from app.domain.fare import compute_residual_due, round_fare_inr
from app.domain.policy import SettlementPolicy
from app.domain.reason_codes import has_valid_auto_residual_reason, normalize_reason_codes


@dataclass(frozen=True)
class SettlementResult:
    estimate_f: int
    approved_m: int
    actual_a: int
    buffer: int
    residual_due: int
    overage_classification: OverageClassification
    rider_charge_at_capture: int
    captain_payout: int
    requires_review: bool
    reason_codes: list[str]
    policy_version: str


def classify_overage(
    residual_due: int,
    reason_codes: list[str | ReasonCode],
    policy: SettlementPolicy,
) -> OverageClassification:
    if residual_due == 0:
        return OverageClassification.NONE

    if residual_due > policy.suspicious_threshold_inr:
        return OverageClassification.SUSPICIOUS_LARGE

    normalized = normalize_reason_codes(reason_codes)
    if ReasonCode.UNKNOWN_REVIEW_REQUIRED.value in normalized:
        return OverageClassification.SUSPICIOUS_LARGE

    if not has_valid_auto_residual_reason(normalized):
        return OverageClassification.SUSPICIOUS_LARGE

    if residual_due <= policy.small_excess_ceiling_inr:
        return OverageClassification.SMALL_VALID

    return OverageClassification.SUSPICIOUS_LARGE


def compute_settlement(
    estimate_f: int,
    approved_m: int,
    actual_a: int | float,
    reason_codes: list[str | ReasonCode],
    policy: SettlementPolicy,
) -> SettlementResult:
    """Compute end-of-ride settlement deterministically."""
    actual = round_fare_inr(float(actual_a)) if isinstance(actual_a, float) else int(actual_a)
    if estimate_f < 0 or approved_m < 0 or actual < 0:
        raise ValueError("fare amounts must be non-negative")

    residual = compute_residual_due(actual, approved_m)
    classification = classify_overage(residual, reason_codes, policy)
    requires_review = classification == OverageClassification.SUSPICIOUS_LARGE

    if classification == OverageClassification.NONE:
        rider_charge_at_capture = actual
    else:
        rider_charge_at_capture = approved_m

    return SettlementResult(
        estimate_f=estimate_f,
        approved_m=approved_m,
        actual_a=actual,
        buffer=policy.buffer_amount_inr,
        residual_due=residual,
        overage_classification=classification,
        rider_charge_at_capture=rider_charge_at_capture,
        captain_payout=actual,
        requires_review=requires_review,
        reason_codes=normalize_reason_codes(reason_codes),
        policy_version=policy.policy_version,
    )
