"""Recovery and support API integration tests (P08)."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from app.main import app
from app.services.residual_due_service import get_residual_due_service
from app.services.settlement_service import get_settlement_service

client = TestClient(app)


def _seed_overage_settlement(ride_id: str = "api_recovery_ride", rider_id: str = "rider_commuter") -> None:
    get_settlement_service().execute(
        ride_id=ride_id,
        rider_id=rider_id,
        captain_id="captain_ravi",
        estimate_f=42,
        approved_m=49,
        actual_a=52,
        reason_codes=["waiting_after_arrival"],
    )


def test_recovery_state_after_settlement() -> None:
    _seed_overage_settlement("api_recovery_ride", "rider_recovery_test")
    response = client.get("/api/riders/rider_recovery_test/recovery-state")
    assert response.status_code == 200
    data = response.json()
    assert data["has_pending_due"] is True
    assert data["pending_amount_inr"] == 3
    assert data["show_banner"] is True


def test_pay_residual_clears_due() -> None:
    rider = "rider_pay_test"
    _seed_overage_settlement("api_pay_ride", rider)
    recovery = client.get(f"/api/riders/{rider}/recovery-state").json()
    due_id = recovery["open_dues"][0]["id"]
    pay = client.post(f"/api/residual-due/{due_id}/pay")
    assert pay.status_code == 200
    assert pay.json()["status"] == "paid"
    after = client.get(f"/api/riders/{rider}/recovery-state").json()
    assert after["has_pending_due"] is False


def test_create_dispute_endpoint() -> None:
    rider = "rider_dispute_test"
    _seed_overage_settlement("api_dispute_ride", rider)
    recovery = client.get(f"/api/riders/{rider}/recovery-state").json()
    due_id = recovery["open_dues"][0]["id"]
    response = client.post(
        "/api/disputes",
        json={
            "ride_id": "api_dispute_ride",
            "rider_id": rider,
            "due_id": due_id,
            "reason": "Waiting charge seems incorrect",
        },
    )
    assert response.status_code == 200
    assert response.json()["status"] == "open"


def test_support_review_queue_lists_suspicious_case() -> None:
    get_settlement_service().execute(
        ride_id="api_review_ride",
        rider_id="rider_commuter",
        captain_id="captain_ravi",
        estimate_f=42,
        approved_m=49,
        actual_a=80,
        reason_codes=[],
    )
    response = client.get("/api/support/review-queue")
    assert response.status_code == 200
    cases = response.json()["cases"]
    assert any(c["ride_id"] == "api_review_ride" for c in cases)


def test_rebooking_eligibility_with_open_due() -> None:
    rider = "rider_rebook_test"
    _seed_overage_settlement("api_rebook_ride", rider)
    response = client.get(f"/api/riders/{rider}/rebooking-eligibility")
    data = response.json()
    assert data["assured_pay_eligible"] is False
    assert data["standard_ride_allowed"] is True


def test_rebooking_repeat_unpaid_blocked() -> None:
    service = get_residual_due_service()
    for ride in ("repeat_a", "repeat_b"):
        service.register_open_due(
            ride_id=ride,
            rider_id="rider_repeat",
            amount_inr=3,
            captured_at_trip_end=49,
            reason_codes=["waiting_after_arrival"],
            created_at=datetime.now(UTC) - timedelta(days=10),
        )
    response = client.get("/api/riders/rider_repeat/rebooking-eligibility")
    data = response.json()
    assert data["restriction"] == "repeat_unpaid_blocked"
