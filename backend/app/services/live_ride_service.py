"""Demo ride playback scenarios for in-progress UX (P06)."""

from dataclasses import dataclass

from app.domain.live_ride import LiveRideProgress, compute_live_ride_progress
from app.domain.policy import SettlementPolicy


@dataclass(frozen=True)
class RidePlaybackStep:
    current_fare: int
    reason_codes: list[str]
    timeline_title: str
    timeline_subtitle: str


@dataclass(frozen=True)
class RidePlaybackScenario:
    id: str
    label: str
    description: str
    estimate_f: int
    approved_m: int
    steps: list[RidePlaybackStep]


def _scenarios() -> dict[str, RidePlaybackScenario]:
    return {
        "within_max": RidePlaybackScenario(
            id="within_max",
            label="Within approved max",
            description="Fare stays at or below estimate — calm ride.",
            estimate_f=42,
            approved_m=49,
            steps=[
                RidePlaybackStep(42, [], "Pickup complete", "Koramangala 5th Block"),
                RidePlaybackStep(42, [], "En route", "On the way to Indiranagar"),
                RidePlaybackStep(44, [], "Approaching drop", "Still within estimate"),
            ],
        ),
        "buffer_zone": RidePlaybackScenario(
            id="buffer_zone",
            label="Entered buffer zone",
            description="Valid waiting charge pushes fare into the buffer.",
            estimate_f=42,
            approved_m=49,
            steps=[
                RidePlaybackStep(42, [], "Pickup complete", "Koramangala 5th Block"),
                RidePlaybackStep(46, ["waiting_after_arrival"], "Waiting at signal", "Fare +₹4"),
                RidePlaybackStep(48, ["waiting_after_arrival"], "Still within max", "Buffer zone active"),
            ],
        ),
        "exceeds_review": RidePlaybackScenario(
            id="exceeds_review",
            label="Review required",
            description="Fare exceeds approved max without a verified reason.",
            estimate_f=42,
            approved_m=49,
            steps=[
                RidePlaybackStep(42, [], "Pickup complete", "Koramangala 5th Block"),
                RidePlaybackStep(49, ["waiting_after_arrival"], "Waiting charge", "At approved max"),
                RidePlaybackStep(52, [], "Above max", "Trip would need review if ended now"),
            ],
        ),
    }


SCENARIOS = _scenarios()


def list_scenarios() -> list[dict]:
    return [
        {
            "id": s.id,
            "label": s.label,
            "description": s.description,
            "step_count": len(s.steps),
        }
        for s in SCENARIOS.values()
    ]


def get_scenario_step(
    scenario_id: str,
    step_index: int,
    policy: SettlementPolicy,
    *,
    assured_pay_active: bool = True,
) -> LiveRideProgress | None:
    scenario = SCENARIOS.get(scenario_id)
    if scenario is None:
        return None
    if step_index < 0 or step_index >= len(scenario.steps):
        return None

    step = scenario.steps[step_index]
    return compute_live_ride_progress(
        scenario.estimate_f,
        scenario.approved_m,
        step.current_fare,
        step.reason_codes,
        policy,
        assured_pay_active=assured_pay_active,
    )


def get_scenario_meta(scenario_id: str) -> RidePlaybackScenario | None:
    return SCENARIOS.get(scenario_id)
