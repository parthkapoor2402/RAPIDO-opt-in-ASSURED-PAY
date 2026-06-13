"""Grok assist API integration tests (P14)."""

import os
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app
from app.services.grok.adapter import GrokApiError

client = TestClient(app)

FARE_BODY = {
    "estimate_f": 42,
    "approved_m": 49,
    "buffer": 7,
    "current_fare": 46,
    "reason_label": "Waiting after arrival",
}

DUE_BODY = {
    "amount_inr": 3,
    "approved_m": 49,
    "actual_a": 52,
    "reason_label": "Waiting after arrival",
}

DISPUTE_BODY = {
    "ride_id": "ride_suspicious",
    "approved_m": 49,
    "actual_a": 80,
    "excess_inr": 31,
    "reason_codes": [],
    "rider_note": "Fare jumped too much",
}


def test_assist_status_disabled_by_default() -> None:
    response = client.get("/api/assist/status")
    assert response.status_code == 200
    data = response.json()
    assert data["grok_enabled"] is False


def test_explain_fare_returns_fallback_without_grok() -> None:
    response = client.post("/api/assist/explain/fare", json=FARE_BODY)
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "fallback"
    assert "₹49" in data["text"]
    assert data["use_case"] == "fare_change"


def test_explain_due_returns_fallback_without_grok() -> None:
    response = client.post("/api/assist/explain/due", json=DUE_BODY)
    assert response.status_code == 200
    assert response.json()["source"] == "fallback"
    assert "₹3" in response.json()["text"]


def test_explain_dispute_summary_returns_fallback_without_grok() -> None:
    response = client.post("/api/assist/explain/dispute", json=DISPUTE_BODY)
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "fallback"
    assert "ride_suspicious" in data["text"]


def test_explain_fare_falls_back_on_api_error() -> None:
    env = {"GROK_COPY_ENABLED": "true", "GROK_API_KEY": "test-key"}
    with patch.dict(os.environ, env, clear=False):
        get_settings.cache_clear()
        with patch(
            "app.services.grok.adapter.httpx.post",
            side_effect=Exception("timeout"),
        ):
            response = client.post("/api/assist/explain/fare", json=FARE_BODY)
    get_settings.cache_clear()
    assert response.status_code == 200
    assert response.json()["source"] == "fallback"
