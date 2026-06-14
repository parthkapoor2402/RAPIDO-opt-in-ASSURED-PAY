"""Settlement execution service (P07)."""

from app.core.config import Settings, get_settings
from app.domain.enums import OverageClassification, SettlementFlowOutcome, SettlementState
from app.domain.models.ledger import build_ledger_events
from app.domain.models.payout import create_payout_from_settlement
from app.domain.models.residual_due import ResidualDue, create_residual_due
from app.domain.models.settlement_record import ExecutedSettlement, new_settlement_id
from app.domain.policy import SettlementPolicy
from app.domain.settlement import compute_settlement


def flow_outcome_from_classification(
    classification: OverageClassification,
) -> SettlementFlowOutcome:
    if classification == OverageClassification.NONE:
        return SettlementFlowOutcome.HAPPY_PATH
    if classification == OverageClassification.SMALL_VALID:
        return SettlementFlowOutcome.VALID_OVERAGE
    return SettlementFlowOutcome.SUSPICIOUS_OVERAGE


def settlement_state_from_outcome(outcome: SettlementFlowOutcome) -> SettlementState:
    if outcome == SettlementFlowOutcome.HAPPY_PATH:
        return SettlementState.COMPLETED
    if outcome == SettlementFlowOutcome.VALID_OVERAGE:
        return SettlementState.RESIDUAL_DUE
    return SettlementState.REVIEW_REQUIRED


class SettlementService:
    def __init__(self, policy: SettlementPolicy) -> None:
        self._policy = policy
        self._by_ride_id: dict[str, ExecutedSettlement] = {}
        self._by_settlement_id: dict[str, ExecutedSettlement] = {}

    @classmethod
    def from_settings(cls, settings: Settings | None = None) -> "SettlementService":
        cfg = settings or get_settings()
        policy = SettlementPolicy(
            buffer_amount_inr=cfg.buffer_amount_inr,
            small_excess_ceiling_inr=cfg.small_excess_ceiling_inr,
            suspicious_threshold_inr=cfg.suspicious_threshold_inr,
            policy_version=cfg.settlement_policy_version,
        )
        return cls(policy)

    def execute(
        self,
        *,
        ride_id: str,
        rider_id: str,
        captain_id: str,
        estimate_f: int,
        approved_m: int,
        actual_a: int,
        reason_codes: list[str],
    ) -> ExecutedSettlement:
        computed = compute_settlement(
            estimate_f=estimate_f,
            approved_m=approved_m,
            actual_a=actual_a,
            reason_codes=reason_codes,
            policy=self._policy,
        )
        outcome = flow_outcome_from_classification(computed.overage_classification)
        state = settlement_state_from_outcome(outcome)

        payout = create_payout_from_settlement(
            ride_id=ride_id,
            captain_id=captain_id,
            actual_a=computed.actual_a,
            requires_review=computed.requires_review,
        )

        residual: ResidualDue | None = None
        if outcome == SettlementFlowOutcome.VALID_OVERAGE:
            residual = create_residual_due(
                ride_id=ride_id,
                rider_id=rider_id,
                approved_m=computed.approved_m,
                actual_a=computed.actual_a,
                reason_codes=computed.reason_codes,
            )

        review_case_id = f"rev_{ride_id}" if computed.requires_review else None

        ledger = build_ledger_events(
            approved_m=computed.approved_m,
            actual_a=computed.actual_a,
            rider_charged=computed.rider_charge_at_capture,
            payout_amount=payout.amount_inr,
            payout_state=payout.state.value,
            residual_amount=residual.amount_inr if residual else None,
            requires_review=computed.requires_review,
        )

        settlement_id = new_settlement_id()
        record = ExecutedSettlement(
            settlement_id=settlement_id,
            ride_id=ride_id,
            rider_id=rider_id,
            captain_id=captain_id,
            estimate_f=computed.estimate_f,
            approved_m=computed.approved_m,
            actual_a=computed.actual_a,
            rider_charged=computed.rider_charge_at_capture,
            flow_outcome=outcome,
            settlement_state=state,
            payout=payout,
            residual_due=residual,
            review_case_id=review_case_id,
            ledger=ledger,
            policy_version=computed.policy_version,
        )
        self._by_ride_id[ride_id] = record
        self._by_settlement_id[settlement_id] = record

        if residual is not None:
            from app.services.residual_due_service import get_residual_due_service

            get_residual_due_service().register_open_due(
                due_id=residual.id,
                ride_id=ride_id,
                rider_id=rider_id,
                amount_inr=residual.amount_inr,
                captured_at_trip_end=residual.captured_at_trip_end,
                reason_codes=residual.reason_codes,
                estimate_f=computed.estimate_f,
                actual_a=computed.actual_a,
            )
        if review_case_id is not None:
            from app.services.support_service import get_support_service

            get_support_service().sync_from_settlement(ride_id)

        return record

    def get_by_ride_id(self, ride_id: str) -> ExecutedSettlement | None:
        return self._by_ride_id.get(ride_id)

    def get_by_settlement_id(self, settlement_id: str) -> ExecutedSettlement | None:
        return self._by_settlement_id.get(settlement_id)


_default_service: SettlementService | None = None


def get_settlement_service() -> SettlementService:
    global _default_service
    if _default_service is None:
        _default_service = SettlementService.from_settings()
    return _default_service
