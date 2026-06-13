"""Captain payout model tests."""

from app.domain.enums import PayoutState
from app.domain.models.payout import CaptainPayoutRecord, create_payout_from_settlement


def test_captain_payout_credited_for_happy_path() -> None:
    payout = create_payout_from_settlement(
        ride_id="r1",
        captain_id="captain_ravi",
        actual_a=46,
        requires_review=False,
    )
    assert payout.state == PayoutState.CREDITED
    assert payout.amount_inr == 46
    assert payout.is_visible_to_captain is True


def test_captain_payout_held_for_review() -> None:
    payout = create_payout_from_settlement(
        ride_id="r2",
        captain_id="captain_ravi",
        actual_a=80,
        requires_review=True,
    )
    assert payout.state == PayoutState.HELD
    assert payout.amount_inr == 80
    record = CaptainPayoutRecord.from_payout(payout)
    assert record.status_label == "Held pending review"
