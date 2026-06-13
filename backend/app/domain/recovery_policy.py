"""Recovery and rebooking policy defaults (DEC-011, DEC-014, DEC-028)."""

from dataclasses import dataclass


@dataclass(frozen=True)
class RecoveryPolicy:
    grace_period_days: int = 7
    max_unpaid_before_hard_block: int = 2
    dispute_window_hours: int = 24
