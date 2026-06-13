"""Rebooking eligibility evaluation for open residual dues."""

from dataclasses import dataclass

from app.domain.enums import RebookingRestriction
from app.domain.recovery_policy import RecoveryPolicy


@dataclass(frozen=True)
class RebookingState:
    assured_pay_eligible: bool
    standard_ride_allowed: bool
    restriction: RebookingRestriction
    grace_active: bool
    unpaid_past_grace_count: int
    open_due_count: int


def evaluate_rebooking(open_dues, policy: RecoveryPolicy) -> RebookingState:
    """Evaluate Assured Pay and standard ride eligibility from open dues."""
    if not open_dues:
        return RebookingState(
            assured_pay_eligible=True,
            standard_ride_allowed=True,
            restriction=RebookingRestriction.NONE,
            grace_active=False,
            unpaid_past_grace_count=0,
            open_due_count=0,
        )

    past_grace = [due for due in open_dues if due.is_past_grace(policy)]
    grace_active = any(not due.is_past_grace(policy) for due in open_dues)

    if len(past_grace) >= policy.max_unpaid_before_hard_block:
        restriction = RebookingRestriction.REPEAT_UNPAID_BLOCKED
    else:
        restriction = RebookingRestriction.ASSURED_PAY_BLOCKED

    return RebookingState(
        assured_pay_eligible=False,
        standard_ride_allowed=True,
        restriction=restriction,
        grace_active=grace_active,
        unpaid_past_grace_count=len(past_grace),
        open_due_count=len(open_dues),
    )
