"""Analytics API integration tests (P09)."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_analytics_summary_endpoint() -> None:
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "frictionless_completion_rate" in data
    assert "captain_payout_success_rate" in data
    assert "residual_recovery_rate" in data
    assert "dispute_rate" in data
    assert "bad_debt_estimate_inr" in data
    assert "repeat_assured_pay_usage_rate" in data
    assert data["event_counts"]["assured_pay_opt_in"] > 0


def test_analytics_summary_scenario_filter() -> None:
    response = client.get("/api/analytics/summary?scenario=healthy")
    assert response.status_code == 200
    assert response.json()["scenario"] == "healthy"


def test_analytics_events_endpoint() -> None:
    response = client.get("/api/analytics/events")
    assert response.status_code == 200
    events = response.json()["events"]
    types = {e["event_type"] for e in events}
    assert "assured_pay_impression" in types
    assert "captain_fully_credited" in types
