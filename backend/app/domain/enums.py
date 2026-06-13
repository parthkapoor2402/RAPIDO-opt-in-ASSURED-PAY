from enum import StrEnum


class ReasonCode(StrEnum):
    """Fare-change reason codes for settlement policy (DEC-007, P04)."""

    WAITING_AFTER_ARRIVAL = "waiting_after_arrival"
    RIDER_REQUESTED_ROUTE_CHANGE = "rider_requested_route_change"
    PICKUP_CORRECTION = "pickup_correction"
    TOLL = "toll"
    UNKNOWN_REVIEW_REQUIRED = "unknown_review_required"


class FareState(StrEnum):
    """In-ride fare zone relative to estimate (F) and approved max (M)."""

    WITHIN_ESTIMATE = "within_estimate"
    IN_BUFFER = "in_buffer"
    EXCEEDS_MAX = "exceeds_max"


class OverageClassification(StrEnum):
    """Settlement overage bucket when actual fare exceeds approved max."""

    NONE = "none"
    SMALL_VALID = "small_valid"
    SUSPICIOUS_LARGE = "suspicious_large"


class PayoutState(StrEnum):
    """Captain wallet settlement state for a completed ride."""

    PENDING = "pending"
    CREDITED = "credited"
    PARTIAL = "partial"
    HELD = "held"
    FAILED = "failed"


class ReviewState(StrEnum):
    """Ops review case lifecycle for suspicious fare overages."""

    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    DENIED = "denied"
    RESOLVED = "resolved"


class SettlementState(StrEnum):
    """End-of-ride settlement lifecycle for a completed ride."""

    COMPLETED = "completed"
    RESIDUAL_DUE = "residual_due"
    REVIEW_REQUIRED = "review_required"


class SettlementFlowOutcome(StrEnum):
    """High-level settlement flow outcome for UI routing."""

    HAPPY_PATH = "happy_path"
    VALID_OVERAGE = "valid_overage"
    SUSPICIOUS_OVERAGE = "suspicious_overage"


class DueStatus(StrEnum):
    """Lifecycle for an open residual due."""

    OPEN = "open"
    PAID = "paid"
    DISPUTED = "disputed"


class DisputeStatus(StrEnum):
    """Rider-initiated dispute lifecycle."""

    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"


class RebookingRestriction(StrEnum):
    """Assured Pay rebooking restriction level."""

    NONE = "none"
    ASSURED_PAY_BLOCKED = "assured_pay_blocked"
    REPEAT_UNPAID_BLOCKED = "repeat_unpaid_blocked"
