"""Live ride trust state and enriched progress (P06)."""

from dataclasses import dataclass

from app.domain.enums import FareState
from app.domain.fare import classify_fare_zone, compute_approved_max, compute_residual_due
from app.domain.policy import SettlementPolicy
from app.domain.settlement import compute_settlement


class TrustState:
    WITHIN_APPROVED_MAX = "within_approved_max"
    ENTERED_BUFFER_ZONE = "entered_buffer_zone"
    REVIEW_REQUIRED = "review_required"


def map_fare_state_to_trust_state(
    fare_state: FareState,
    *,
    requires_review_if_ended: bool,
) -> str:
    if requires_review_if_ended or fare_state == FareState.EXCEEDS_MAX:
        return TrustState.REVIEW_REQUIRED
    if fare_state == FareState.IN_BUFFER:
        return TrustState.ENTERED_BUFFER_ZONE
    return TrustState.WITHIN_APPROVED_MAX


REASON_LABELS: dict[str, str] = {
    "waiting_after_arrival": "Waiting after arrival",
    "rider_requested_route_change": "Route change",
    "pickup_correction": "Pickup correction",
    "toll": "Toll",
    "unknown_review_required": "Unverified change",
}


@dataclass(frozen=True)
class FareReasonUpdate:
    time_label: str
    amount_inr: int
    delta_inr: int
    reason_code: str
    reason_label: str


def reason_label(code: str) -> str:
    return REASON_LABELS.get(code, code.replace("_", " ").title())


def build_reason_updates(
    estimate_f: int,
    current_fare: int,
    reason_codes: list[str],
) -> list[FareReasonUpdate]:
    if not reason_codes or current_fare <= estimate_f:
        return []

    updates: list[FareReasonUpdate] = []
    running = estimate_f
    times = ["8:12", "8:18", "8:24", "8:30"]
    for index, code in enumerate(reason_codes):
        if running >= current_fare:
            break
        delta = max(1, (current_fare - estimate_f) // len(reason_codes))
        running = min(current_fare, running + delta)
        updates.append(
            FareReasonUpdate(
                time_label=times[min(index, len(times) - 1)],
                amount_inr=running,
                delta_inr=delta,
                reason_code=code,
                reason_label=reason_label(code),
            ),
        )
    if updates and updates[-1].amount_inr != current_fare:
        last = updates[-1]
        updates[-1] = FareReasonUpdate(
            time_label=last.time_label,
            amount_inr=current_fare,
            delta_inr=current_fare - (running - last.delta_inr),
            reason_code=last.reason_code,
            reason_label=last.reason_label,
        )
    return updates


@dataclass(frozen=True)
class LiveRideProgress:
    estimate_f: int
    approved_m: int
    buffer: int
    current_fare: int
    fare_state: FareState
    trust_state: str
    residual_due_if_ended_now: int
    requires_review_if_ended_now: bool
    assured_pay_active: bool
    reason_updates: list[FareReasonUpdate]
    latest_reason_code: str | None
    policy_version: str


def compute_live_ride_progress(
    estimate_f: int,
    approved_m: int,
    current_fare: int,
    reason_codes: list[str],
    policy: SettlementPolicy,
    *,
    assured_pay_active: bool = True,
) -> LiveRideProgress:
    fare_state = classify_fare_zone(current_fare, estimate_f, approved_m)
    settlement = compute_settlement(
        estimate_f,
        approved_m,
        current_fare,
        reason_codes,
        policy,
    )
    trust_state = map_fare_state_to_trust_state(
        fare_state,
        requires_review_if_ended=settlement.requires_review,
    )
    updates = build_reason_updates(estimate_f, current_fare, reason_codes)
    latest = reason_codes[-1] if reason_codes else None

    return LiveRideProgress(
        estimate_f=estimate_f,
        approved_m=approved_m,
        buffer=policy.buffer_amount_inr,
        current_fare=current_fare,
        fare_state=fare_state,
        trust_state=trust_state,
        residual_due_if_ended_now=settlement.residual_due,
        requires_review_if_ended_now=settlement.requires_review,
        assured_pay_active=assured_pay_active,
        reason_updates=updates,
        latest_reason_code=latest,
        policy_version=policy.policy_version,
    )


def booking_estimate_triplet(estimate_f: int, policy: SettlementPolicy) -> tuple[int, int, int]:
    buffer = policy.buffer_amount_inr
    return estimate_f, buffer, compute_approved_max(estimate_f, buffer)
