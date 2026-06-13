from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.fare import FarePreviewRequest, FarePreviewResponse
from app.services.fare_engine_service import FareEngineService

router = APIRouter(tags=["fare"])


@router.post("/preview", response_model=FarePreviewResponse)
def fare_preview(body: FarePreviewRequest) -> FarePreviewResponse:
    """Preview fare zone and residual if the ride ended at current fare."""
    service = FareEngineService.from_settings(get_settings())
    return service.fare_preview(body.estimate_f, body.approved_m, body.current_fare)
