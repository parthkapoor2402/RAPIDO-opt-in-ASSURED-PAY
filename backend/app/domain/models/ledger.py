"""Settlement ledger event timeline."""

from dataclasses import dataclass
from datetime import UTC, datetime


@dataclass(frozen=True)
class LedgerEvent:
    event_type: str
    label: str
    amount_inr: int | None
    actor: str
    timestamp: str


def ledger_timestamp() -> str:
    return datetime.now(UTC).isoformat()


def build_ledger_events(
    *,
    approved_m: int,
    actual_a: int,
    rider_charged: int,
    payout_amount: int,
    payout_state: str,
    residual_amount: int | None,
    requires_review: bool,
) -> list[LedgerEvent]:
    ts = ledger_timestamp()
    events: list[LedgerEvent] = [
        LedgerEvent(
            event_type="trip_ended",
            label="Trip ended",
            amount_inr=actual_a,
            actor="system",
            timestamp=ts,
        ),
        LedgerEvent(
            event_type="rider_charged",
            label="Rider charged at trip end",
            amount_inr=rider_charged,
            actor="rider",
            timestamp=ts,
        ),
        LedgerEvent(
            event_type="approved_max",
            label="Approved max (M)",
            amount_inr=approved_m,
            actor="system",
            timestamp=ts,
        ),
    ]

    if residual_amount is not None and residual_amount > 0:
        events.append(
            LedgerEvent(
                event_type="residual_created",
                label="Residual due created",
                amount_inr=residual_amount,
                actor="rider",
                timestamp=ts,
            )
        )

    if requires_review:
        events.append(
            LedgerEvent(
                event_type="review_queued",
                label="Ops review queued",
                amount_inr=actual_a - approved_m,
                actor="ops",
                timestamp=ts,
            )
        )
        events.append(
            LedgerEvent(
                event_type="captain_payout_held",
                label="Captain payout held pending review",
                amount_inr=payout_amount,
                actor="captain",
                timestamp=ts,
            )
        )
    else:
        events.append(
            LedgerEvent(
                event_type="captain_credited",
                label="Captain credited",
                amount_inr=payout_amount,
                actor="captain",
                timestamp=ts,
            )
        )

    return events
