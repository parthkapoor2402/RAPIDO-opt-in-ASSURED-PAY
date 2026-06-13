"""Fare engine orchestration — thin layer over pure domain modules."""

from app.core.config import Settings
from app.domain.fare import classify_fare_zone, compute_approved_max, compute_residual_due
from app.domain.live_ride import LiveRideProgress, compute_live_ride_progress
from app.domain.policy import SettlementPolicy, policy_from_settings
from app.domain.settlement import SettlementResult, compute_settlement
from app.schemas.fare import (
    BookingEstimateResponse,
    FarePreviewResponse,
    FareReasonUpdateResponse,
    RideProgressResponse,
    SettlementPreviewResponse,
)


def _live_progress_to_response(progress: LiveRideProgress) -> RideProgressResponse:
    return RideProgressResponse(
        estimate_f=progress.estimate_f,
        approved_m=progress.approved_m,
        buffer=progress.buffer,
        current_fare=progress.current_fare,
        fare_state=progress.fare_state.value,
        trust_state=progress.trust_state,
        residual_due_if_ended_now=progress.residual_due_if_ended_now,
        requires_review_if_ended_now=progress.requires_review_if_ended_now,
        assured_pay_active=progress.assured_pay_active,
        reason_updates=[
            FareReasonUpdateResponse(
                time_label=u.time_label,
                amount_inr=u.amount_inr,
                delta_inr=u.delta_inr,
                reason_code=u.reason_code,
                reason_label=u.reason_label,
            )
            for u in progress.reason_updates
        ],
        latest_reason_code=progress.latest_reason_code,
        policy_version=progress.policy_version,
    )


class FareEngineService:
    """Framework-agnostic fare engine exposed via API adapters."""

    def __init__(self, policy: SettlementPolicy) -> None:
        self._policy = policy

    @classmethod
    def from_settings(cls, settings: Settings) -> "FareEngineService":
        return cls(policy_from_settings(settings))

    def booking_estimate(self, estimate_f: int) -> BookingEstimateResponse:
        m = compute_approved_max(estimate_f, self._policy.buffer_amount_inr)
        return BookingEstimateResponse(
            F=estimate_f,
            buffer=self._policy.buffer_amount_inr,
            M=m,
            policy_version=self._policy.policy_version,
        )

    def fare_preview(
        self,
        estimate_f: int,
        approved_m: int,
        current_fare: int,
    ) -> FarePreviewResponse:
        state = classify_fare_zone(current_fare, estimate_f, approved_m)
        return FarePreviewResponse(
            estimate_f=estimate_f,
            approved_m=approved_m,
            current_fare=current_fare,
            fare_state=state.value,
            residual_due_if_ended_now=compute_residual_due(current_fare, approved_m),
        )

    def ride_progress(
        self,
        estimate_f: int,
        approved_m: int,
        current_fare: int,
        reason_codes: list[str] | None = None,
        *,
        assured_pay_active: bool = True,
    ) -> RideProgressResponse:
        progress = compute_live_ride_progress(
            estimate_f,
            approved_m,
            current_fare,
            reason_codes or [],
            self._policy,
            assured_pay_active=assured_pay_active,
        )
        return _live_progress_to_response(progress)

    def settlement_preview(
        self,
        estimate_f: int,
        approved_m: int,
        actual_a: int,
        reason_codes: list[str],
    ) -> SettlementPreviewResponse:
        result: SettlementResult = compute_settlement(
            estimate_f,
            approved_m,
            actual_a,
            reason_codes,
            self._policy,
        )
        return SettlementPreviewResponse(
            F=result.estimate_f,
            M=result.approved_m,
            A=result.actual_a,
            buffer=result.buffer,
            residual_due=result.residual_due,
            overage_classification=result.overage_classification.value,
            rider_charge_at_capture=result.rider_charge_at_capture,
            captain_payout=result.captain_payout,
            requires_review=result.requires_review,
            reason_codes=result.reason_codes,
            policy_version=result.policy_version,
        )
