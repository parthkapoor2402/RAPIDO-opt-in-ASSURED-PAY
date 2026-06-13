from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_eligibility_for_commuter_with_free_trial() -> None:
    response = client.get(
        "/api/assured-pay/eligibility",
        headers={"X-Rider-Id": "rider_commuter"},
        params={"payment_method": "upi"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["eligible"] is True
    assert data["F"] == 42
    assert data["buffer"] == 7
    assert data["M"] == 49
    assert data["free_trial_available"] is True
    assert "online_payer" in {p["id"] for p in data["prompts"]}


def test_eligibility_blocked_for_open_residual() -> None:
    response = client.get(
        "/api/assured-pay/eligibility",
        headers={"X-Rider-Id": "rider_blocked"},
    )
    data = response.json()
    assert data["eligible"] is False
    assert "open_residual" in data["block_reasons"]
    assert data["prompts"] == []


def test_low_battery_prompt_via_override() -> None:
    response = client.get(
        "/api/assured-pay/eligibility",
        headers={"X-Rider-Id": "rider_commuter"},
        params={"battery_low_override": True},
    )
    ids = {p["id"] for p in response.json()["prompts"]}
    assert "low_battery" in ids


def test_authorize_opt_in_success() -> None:
    response = client.post(
        "/api/assured-pay/authorize",
        headers={"X-Rider-Id": "rider_commuter"},
        json={
            "ride_id": "ride_1001",
            "payment_instrument_id": "upi_default",
            "discovery_source": "booking_card",
            "consent": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["authorized"] is True
    assert data["M"] == 49
    assert data["free_trial_applied"] is True


def test_authorize_rejected_when_blocked() -> None:
    response = client.post(
        "/api/assured-pay/authorize",
        headers={"X-Rider-Id": "rider_blocked"},
        json={
            "ride_id": "ride_1002",
            "discovery_source": "booking_card",
            "consent": True,
        },
    )
    data = response.json()
    assert data["authorized"] is False
