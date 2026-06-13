"""Executed settlement record."""

from dataclasses import dataclass
from uuid import uuid4

from app.domain.enums import SettlementFlowOutcome, SettlementState
from app.domain.models.ledger import LedgerEvent
from app.domain.models.payout import CaptainPayout
from app.domain.models.residual_due import ResidualDue


@dataclass(frozen=True)
class ExecutedSettlement:
    settlement_id: str
    ride_id: str
    rider_id: str
    captain_id: str
    estimate_f: int
    approved_m: int
    actual_a: int
    rider_charged: int
    flow_outcome: SettlementFlowOutcome
    settlement_state: SettlementState
    payout: CaptainPayout
    residual_due: ResidualDue | None
    review_case_id: str | None
    ledger: list[LedgerEvent]
    policy_version: str


def new_settlement_id() -> str:
    return f"stl_{uuid4().hex[:12]}"
