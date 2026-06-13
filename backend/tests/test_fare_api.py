"""API integration tests for fare engine endpoints."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_booking_estimate_returns_f_buffer_m() -> None:
    response = client.post("/api/booking/estimate", json={"estimate_f": 42})
    assert response.status_code == 200
    data = response.json()
    assert data["F"] == 42
    assert data["buffer"] == 7
    assert data["M"] == 49


def test_fare_preview_in_buffer_zone() -> None:
    response = client.post(
        "/api/fare/preview",
        json={"estimate_f": 42, "approved_m": 49, "current_fare": 46},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["fare_state"] == "in_buffer"


def test_ride_progress_endpoint() -> None:
    response = client.get(
        "/api/ride/progress",
        params={"estimate_f": 42, "approved_m": 49, "current_fare": 50},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["fare_state"] == "exceeds_max"
    assert data["trust_state"] == "review_required"
    assert data["buffer"] == 7
    assert data["residual_due_if_ended_now"] == 1


def test_settlement_preview_small_valid() -> None:
    response = client.post(
        "/api/settlement/preview",
        json={
            "estimate_f": 42,
            "approved_m": 49,
            "actual_a": 50,
            "reason_codes": ["waiting_after_arrival"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["residual_due"] == 1
    assert data["overage_classification"] == "small_valid"
    assert data["requires_review"] is False
    assert data["captain_payout"] == 50


def test_settlement_preview_suspicious() -> None:
    response = client.post(
        "/api/settlement/preview",
        json={
            "estimate_f": 42,
            "approved_m": 49,
            "actual_a": 80,
            "reason_codes": ["toll"],
        },
    )
    data = response.json()
    assert data["overage_classification"] == "suspicious_large"
    assert data["requires_review"] is True
