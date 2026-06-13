"""Settlement policy configuration (DEC-004, DEC-005, DEC-006)."""

from dataclasses import dataclass

from app.core.config import Settings


@dataclass(frozen=True)
class SettlementPolicy:
    buffer_amount_inr: int
    small_excess_ceiling_inr: int
    suspicious_threshold_inr: int
    policy_version: str

    def __post_init__(self) -> None:
        if self.buffer_amount_inr < 0:
            raise ValueError("buffer_amount_inr must be non-negative")
        if self.small_excess_ceiling_inr < 0:
            raise ValueError("small_excess_ceiling_inr must be non-negative")
        if self.suspicious_threshold_inr < 0:
            raise ValueError("suspicious_threshold_inr must be non-negative")


def policy_from_settings(settings: Settings) -> SettlementPolicy:
    return SettlementPolicy(
        buffer_amount_inr=settings.buffer_amount_inr,
        small_excess_ceiling_inr=settings.small_excess_ceiling_inr,
        suspicious_threshold_inr=settings.suspicious_threshold_inr,
        policy_version=settings.settlement_policy_version,
    )
