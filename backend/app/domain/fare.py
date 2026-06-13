"""Pure fare calculations — framework-agnostic (P04)."""

import math

from app.domain.enums import FareState


def compute_approved_max(estimate_f: int, buffer_inr: int) -> int:
    """Return approved max M = F + buffer."""
    if estimate_f < 0:
        raise ValueError("estimate_f must be non-negative")
    if buffer_inr < 0:
        raise ValueError("buffer_inr must be non-negative")
    return estimate_f + buffer_inr


def round_fare_inr(amount: float) -> int:
    """Round fare to nearest rupee (half up)."""
    if amount < 0:
        raise ValueError("amount must be non-negative")
    return int(math.floor(amount + 0.5))


def compute_residual_due(actual_a: int, approved_m: int) -> int:
    """Residual due = max(0, A - M)."""
    if actual_a < 0:
        raise ValueError("actual_a must be non-negative")
    if approved_m < 0:
        raise ValueError("approved_m must be non-negative")
    return max(0, actual_a - approved_m)


def classify_fare_zone(current_fare: int, estimate_f: int, approved_m: int) -> FareState:
    """Classify in-ride fare relative to F and M."""
    if current_fare < 0 or estimate_f < 0 or approved_m < 0:
        raise ValueError("fare amounts must be non-negative")
    if current_fare <= estimate_f:
        return FareState.WITHIN_ESTIMATE
    if current_fare <= approved_m:
        return FareState.IN_BUFFER
    return FareState.EXCEEDS_MAX
