"""Settlement API integration tests for three flow outcomes."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

HAPPY_BODY = {
    "ride_id": "api_happy",
    "rider_id": "rider_commuter",
    "captain_id": "captain_ravi",
    "estimate_f": 42,
    "approved_m": 49,
    "actual_a": 46,
    "reason_codes": ["waiting_after_arrival"],
}

OVERAGE_BODY = {
    **HAPPY_BODY,
    "ride_id": "api_overage",
    "actual_a": 52,
}

SUSPICIOUS_BODY = {
    **HAPPY_BODY,
    "ride_id": "api_suspicious",
    "actual_a": 80,
    "reason_codes": [],
}


def test_execute_happy_path() -> None:
    response = client.post("/api/settlement/execute", json=HAPPY_BODY)
    assert response.status_code == 200
    data = response.json()
    assert data["flow_outcome"] == "happy_path"
    assert data["settlement_state"] == "completed"
    assert data["payout"]["state"] == "credited"
    assert data["residual_due"] is None
    assert data["approved_m"] == 49
    assert data["rider_charged"] == 46


def test_execute_valid_overage() -> None:
    response = client.post("/api/settlement/execute", json=OVERAGE_BODY)
    data = response.json()
    assert data["flow_outcome"] == "valid_overage"
    assert data["residual_due"]["amount_inr"] == 3
    assert data["payout"]["amount_inr"] == 52


def test_execute_suspicious_overage() -> None:
    response = client.post("/api/settlement/execute", json=SUSPICIOUS_BODY)
    data = response.json()
    assert data["flow_outcome"] == "suspicious_overage"
    assert data["settlement_state"] == "review_required"
    assert data["payout"]["state"] == "held"


def test_get_settlement_by_ride_id() -> None:
    client.post("/api/settlement/execute", json=HAPPY_BODY)
    response = client.get("/api/settlement/by-ride/api_happy")
    assert response.status_code == 200
    assert response.json()["ride_id"] == "api_happy"


def test_captain_payout_endpoint() -> None:
    client.post("/api/settlement/execute", json=OVERAGE_BODY)
    response = client.get("/api/captain/payouts/api_overage")
    assert response.status_code == 200
    assert response.json()["amount_inr"] == 52


def test_residual_due_endpoint() -> None:
    client.post("/api/settlement/execute", json=OVERAGE_BODY)
    response = client.get("/api/residual-due/by-ride/api_overage")
    assert response.status_code == 200
    assert response.json()["amount_inr"] == 3
