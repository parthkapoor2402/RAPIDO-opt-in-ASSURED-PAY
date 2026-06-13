"""Captain payout state model."""

from dataclasses import dataclass
from datetime import UTC, datetime

from app.domain.enums import PayoutState


@dataclass(frozen=True)
class CaptainPayout:
    ride_id: str
    captain_id: str
    amount_inr: int
    state: PayoutState
    credited_at: datetime | None
    is_visible_to_captain: bool = True


@dataclass(frozen=True)
class CaptainPayoutRecord:
    ride_id: str
    captain_id: str
    amount_inr: int
    state: PayoutState
    status_label: str
    credited_at: datetime | None

    @classmethod
    def from_payout(cls, payout: CaptainPayout) -> "CaptainPayoutRecord":
        labels = {
            PayoutState.CREDITED: "Credited to wallet",
            PayoutState.HELD: "Held pending review",
            PayoutState.PENDING: "Pending",
            PayoutState.PARTIAL: "Partially credited",
            PayoutState.FAILED: "Failed",
        }
        return cls(
            ride_id=payout.ride_id,
            captain_id=payout.captain_id,
            amount_inr=payout.amount_inr,
            state=payout.state,
            status_label=labels.get(payout.state, payout.state.value),
            credited_at=payout.credited_at,
        )


def create_payout_from_settlement(
    *,
    ride_id: str,
    captain_id: str,
    actual_a: int,
    requires_review: bool,
) -> CaptainPayout:
    if requires_review:
        return CaptainPayout(
            ride_id=ride_id,
            captain_id=captain_id,
            amount_inr=actual_a,
            state=PayoutState.HELD,
            credited_at=None,
        )
    return CaptainPayout(
        ride_id=ride_id,
        captain_id=captain_id,
        amount_inr=actual_a,
        state=PayoutState.CREDITED,
        credited_at=datetime.now(UTC),
    )
