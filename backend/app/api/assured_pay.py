from fastapi import APIRouter, Header, Query

from app.core.config import get_settings
from app.schemas.assured_pay import AuthorizeRequest, AuthorizeResponse, EligibilityResponse
from app.services.assured_pay_service import authorize_opt_in, get_eligibility

router = APIRouter(tags=["assured-pay"])


@router.get("/eligibility", response_model=EligibilityResponse)
def assured_pay_eligibility(
    payment_method: str = Query(default="cash"),
    battery_level: float | None = Query(default=None),
    battery_low_override: bool = Query(default=False),
    estimate_f: int = Query(default=42, ge=0),
    x_rider_id: str | None = Header(default=None, alias="X-Rider-Id"),
) -> EligibilityResponse:
    """Return Assured Pay eligibility, fare ceiling, and discovery prompts."""
    rider_id = x_rider_id or "rider_commuter"
    settings = get_settings()
    return get_eligibility(
        rider_id,
        settings,
        payment_method=payment_method,
        battery_level=battery_level,
        battery_low_override=battery_low_override,
        estimate_f=estimate_f,
    )


@router.post("/authorize", response_model=AuthorizeResponse)
def assured_pay_authorize(
    body: AuthorizeRequest,
    estimate_f: int = Query(default=42, ge=0),
    x_rider_id: str | None = Header(default=None, alias="X-Rider-Id"),
) -> AuthorizeResponse:
    """Explicit opt-in authorization for Assured Pay on a ride."""
    rider_id = x_rider_id or "rider_commuter"
    settings = get_settings()
    return authorize_opt_in(rider_id, settings, body, estimate_f=estimate_f)
