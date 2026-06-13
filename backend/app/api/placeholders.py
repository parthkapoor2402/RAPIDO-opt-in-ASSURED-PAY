from fastapi import APIRouter

from app.schemas.common import PlaceholderResponse


def create_placeholder_router(module: str) -> APIRouter:
    """Factory for module stub routers — replaced in feature phases."""
    router = APIRouter()

    @router.get("", response_model=PlaceholderResponse)
    def module_stub() -> PlaceholderResponse:
        return PlaceholderResponse(module=module)

    return router
