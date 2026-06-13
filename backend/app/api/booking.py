from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import PlaceholderResponse
from app.schemas.fare import BookingEstimateRequest, BookingEstimateResponse
from app.services.fare_engine_service import FareEngineService

router = APIRouter(tags=["booking"])


@router.get("", response_model=PlaceholderResponse, include_in_schema=False)
def booking_stub() -> PlaceholderResponse:
    """Legacy scaffold stub — use POST /estimate for fare engine."""
    return PlaceholderResponse(module="booking")


@router.post("/estimate", response_model=BookingEstimateResponse)
def booking_estimate(body: BookingEstimateRequest) -> BookingEstimateResponse:
    """Return F, buffer, and approved max M for a bike booking."""
    service = FareEngineService.from_settings(get_settings())
    return service.booking_estimate(body.estimate_f)
