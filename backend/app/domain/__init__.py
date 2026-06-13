"""Domain models, enums, and pure fare/settlement logic."""

from app.domain.enums import (
    FareState,
    OverageClassification,
    PayoutState,
    ReasonCode,
    ReviewState,
)
from app.domain.fare import (
    classify_fare_zone,
    compute_approved_max,
    compute_residual_due,
    round_fare_inr,
)
from app.domain.policy import SettlementPolicy, policy_from_settings
from app.domain.settlement import SettlementResult, compute_settlement

__all__ = [
    "ReasonCode",
    "FareState",
    "OverageClassification",
    "PayoutState",
    "ReviewState",
    "SettlementPolicy",
    "SettlementResult",
    "policy_from_settings",
    "compute_approved_max",
    "compute_residual_due",
    "classify_fare_zone",
    "round_fare_inr",
    "compute_settlement",
]
