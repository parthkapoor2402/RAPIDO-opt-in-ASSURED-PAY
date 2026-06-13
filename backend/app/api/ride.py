from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings
from app.schemas.common import PlaceholderResponse
from app.schemas.fare import RideProgressResponse, RideScenarioListResponse
from app.services.fare_engine_service import FareEngineService, _live_progress_to_response
from app.services.live_ride_service import get_scenario_step, list_scenarios

router = APIRouter(tags=["ride"])


@router.get("", response_model=PlaceholderResponse, include_in_schema=False)
def ride_stub() -> PlaceholderResponse:
    return PlaceholderResponse(module="ride")


def _parse_reason_codes(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [part.strip() for part in raw.split(",") if part.strip()]


@router.get("/progress", response_model=RideProgressResponse)
def ride_progress(
    estimate_f: int = Query(default=42, ge=0),
    approved_m: int = Query(default=49, ge=0),
    current_fare: int = Query(default=46, ge=0),
    reason_codes: str | None = Query(default=None),
    assured_pay_active: bool = Query(default=True),
) -> RideProgressResponse:
    """Live ride progress with fare zone, trust state, and reason updates."""
    service = FareEngineService.from_settings(get_settings())
    return service.ride_progress(
        estimate_f,
        approved_m,
        current_fare,
        _parse_reason_codes(reason_codes),
        assured_pay_active=assured_pay_active,
    )


@router.get("/scenarios", response_model=RideScenarioListResponse)
def ride_scenarios() -> RideScenarioListResponse:
    """List demo playback scenarios for in-ride UX."""
    return RideScenarioListResponse(scenarios=list_scenarios())


@router.get("/scenarios/{scenario_id}/step/{step_index}", response_model=RideProgressResponse)
def ride_scenario_step(scenario_id: str, step_index: int) -> RideProgressResponse:
    """Return progress payload for a demo scenario step."""
    from app.domain.policy import policy_from_settings

    progress = get_scenario_step(
        scenario_id,
        step_index,
        policy_from_settings(get_settings()),
    )
    if progress is None:
        raise HTTPException(status_code=404, detail="Scenario or step not found")
    return _live_progress_to_response(progress)
