"""Residual due generation tests."""

from app.domain.models.residual_due import ResidualDueRecord, create_residual_due


def test_residual_due_amount_is_a_minus_m() -> None:
    due = create_residual_due(
        ride_id="r1",
        rider_id="rider_commuter",
        approved_m=49,
        actual_a=52,
        reason_codes=["waiting_after_arrival"],
    )
    assert due.amount_inr == 3
    assert due.captured_at_trip_end == 49
    assert due.status == "open"


def test_residual_due_record_exposes_reason_label() -> None:
    due = create_residual_due(
        ride_id="r1",
        rider_id="rider_commuter",
        approved_m=49,
        actual_a=51,
        reason_codes=["waiting_after_arrival"],
    )
    record = ResidualDueRecord.from_due(due)
    assert "Waiting" in record.reason_label or "waiting" in record.reason_label.lower()
