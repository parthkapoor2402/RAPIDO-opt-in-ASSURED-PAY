"""Assured Pay eligibility rules for rider discovery (P05)."""

from dataclasses import dataclass

from app.domain.enums import ReasonCode


@dataclass(frozen=True)
class RiderProfile:
    rider_id: str
    has_open_residual: bool = False
    has_payment_instrument: bool = True
    prior_payment_failure: bool = False
    free_trial_available: bool = False
    online_payment_ride_count: int = 0


def is_eligible(profile: RiderProfile) -> tuple[bool, list[str]]:
    """Return eligibility and human-readable block reasons."""
    reasons: list[str] = []
    if profile.has_open_residual:
        reasons.append("open_residual")
    if not profile.has_payment_instrument:
        reasons.append("payment_instrument_required")
    return (len(reasons) == 0, reasons)


def valid_reason_code_labels() -> list[str]:
    return [code.value for code in ReasonCode]
