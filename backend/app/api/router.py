from fastapi import APIRouter

from app.api.analytics import router as analytics_router
from app.api.assist import router as assist_router
from app.api.assured_pay import router as assured_pay_router
from app.api.booking import router as booking_router
from app.api.captain import router as captain_router
from app.api.disputes import router as disputes_router
from app.api.fare import router as fare_router
from app.api.health import router as health_router
from app.api.residual_due import router as residual_due_router
from app.api.ride import router as ride_router
from app.api.riders import router as riders_router
from app.api.settlement import router as settlement_router
from app.api.support import router as support_router
from app.api.version import router as version_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(version_router)
api_router.include_router(booking_router, prefix="/booking")
api_router.include_router(fare_router, prefix="/fare")
api_router.include_router(assured_pay_router, prefix="/assured-pay")
api_router.include_router(ride_router, prefix="/ride")
api_router.include_router(settlement_router, prefix="/settlement")
api_router.include_router(captain_router, prefix="/captain")
api_router.include_router(residual_due_router, prefix="/residual-due")
api_router.include_router(riders_router, prefix="/riders")
api_router.include_router(disputes_router, prefix="/disputes")
api_router.include_router(support_router, prefix="/support")
api_router.include_router(analytics_router, prefix="/analytics")
api_router.include_router(assist_router, prefix="/assist")
