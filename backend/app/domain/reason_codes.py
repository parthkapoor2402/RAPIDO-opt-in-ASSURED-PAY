"""Reason code validation for auto-residual policy."""

from app.domain.enums import ReasonCode

AUTO_RESIDUAL_REASONS: frozenset[ReasonCode] = frozenset(
    {
        ReasonCode.WAITING_AFTER_ARRIVAL,
        ReasonCode.RIDER_REQUESTED_ROUTE_CHANGE,
        ReasonCode.PICKUP_CORRECTION,
        ReasonCode.TOLL,
    }
)


def normalize_reason_codes(codes: list[str | ReasonCode]) -> list[str]:
    """Deduplicate and normalize reason codes to string values."""
    seen: set[str] = set()
    normalized: list[str] = []
    for code in codes:
        if isinstance(code, ReasonCode):
            value = code.value
        else:
            value = str(code).strip().lower()
        if not value or value in seen:
            continue
        seen.add(value)
        normalized.append(value)
    return normalized


def is_auto_residual_reason(code: str | ReasonCode | None) -> bool:
    if code is None:
        return False
    try:
        if isinstance(code, ReasonCode):
            reason = code
        else:
            reason = ReasonCode(str(code).strip().lower())
    except ValueError:
        return False
    return reason in AUTO_RESIDUAL_REASONS


def has_valid_auto_residual_reason(codes: list[str | ReasonCode]) -> bool:
    normalized = normalize_reason_codes(codes)
    return any(is_auto_residual_reason(code) for code in normalized)
