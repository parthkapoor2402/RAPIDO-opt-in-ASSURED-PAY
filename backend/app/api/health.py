from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
def api_health() -> HealthResponse:
    return HealthResponse(status="ok", service=settings.app_name)
