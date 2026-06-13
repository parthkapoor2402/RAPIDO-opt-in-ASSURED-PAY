from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import VersionResponse

router = APIRouter(tags=["meta"])
settings = get_settings()


@router.get("/version", response_model=VersionResponse)
def api_version() -> VersionResponse:
    return VersionResponse(
        name=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        settlement_policy_version=settings.settlement_policy_version,
    )
