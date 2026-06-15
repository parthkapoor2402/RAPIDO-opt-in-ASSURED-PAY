"""Exhaustive ride progress API payload tests (P06)."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.mark.parametrize(
    ("current_fare", "expected_fare_state", "expected_trust_state"),
    [
        (42, "within_estimate", "within_approved_max"),
        (46, "in_buffer", "entered_buffer_zone"),
        (50, "exceeds_max", "review_required"),
    ],
)
def test_ride_progress_trust_state_by_fare_zone(
    current_fare: int,
    expected_fare_state: str,
    expected_trust_state: str,
) -> None:
    response = client.get(
        "/api/ride/progress",
        params={"estimate_f": 42, "approved_m": 49, "current_fare": current_fare},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["fare_state"] == expected_fare_state
    assert data["trust_state"] == expected_trust_state
    assert data["estimate_f"] == 42
    assert data["approved_m"] == 49
    assert data["buffer"] == 7
    assert data["current_fare"] == current_fare


def test_ride_progress_includes_reason_updates_when_provided() -> None:
    response = client.get(
        "/api/ride/progress",
        params={
            "estimate_f": 42,
            "approved_m": 49,
            "current_fare": 46,
            "reason_codes": "waiting_after_arrival",
        },
    )
    data = response.json()
    assert len(data["reason_updates"]) >= 1
    assert data["reason_updates"][-1]["reason_code"] == "waiting_after_arrival"
    assert data["latest_reason_code"] == "waiting_after_arrival"


def test_ride_progress_requires_review_flag_when_exceeds_max_without_reason() -> None:
    response = client.get(
        "/api/ride/progress",
        params={"estimate_f": 42, "approved_m": 49, "current_fare": 51},
    )
    data = response.json()
    assert data["requires_review_if_ended_now"] is True
    assert data["residual_due_if_ended_now"] == 2


def test_ride_progress_small_excess_with_valid_reason_not_review() -> None:
    response = client.get(
        "/api/ride/progress",
        params={
            "estimate_f": 42,
            "approved_m": 49,
            "current_fare": 50,
            "reason_codes": "waiting_after_arrival",
        },
    )
    data = response.json()
    assert data["requires_review_if_ended_now"] is False
    assert data["trust_state"] == "review_required"  # still in exceeds_max zone live


def test_ride_scenario_playback_steps() -> None:
    list_response = client.get("/api/ride/scenarios")
    assert list_response.status_code == 200
    scenarios = list_response.json()["scenarios"]
    assert len(scenarios) >= 3
    within = next(s for s in scenarios if s["id"] == "within_max")
    assert within["label"] == "At estimated fare"
    assert within["step_count"] == 4

    step_response = client.get("/api/ride/scenarios/within_max/step/0")
    assert step_response.status_code == 200
    step = step_response.json()
    assert step["current_fare"] == 42
    assert step["trust_state"] == "within_approved_max"

    final_step = client.get("/api/ride/scenarios/buffer_zone/step/2")
    assert final_step.json()["trust_state"] == "entered_buffer_zone"

    completion_step = client.get("/api/ride/scenarios/within_max/step/3")
    assert completion_step.status_code == 200
    assert completion_step.json()["current_fare"] == 42


def test_ride_scenario_unknown_returns_404() -> None:
    response = client.get("/api/ride/scenarios/not_real/step/0")
    assert response.status_code == 404
