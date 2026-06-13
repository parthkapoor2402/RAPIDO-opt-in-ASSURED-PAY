"""Rider recovery and rebooking API (P08)."""

from fastapi import APIRouter

from app.schemas.recovery import RecoveryStateResponse, RebookingStateResponse
from app.services.recovery_service import get_recovery_service
from app.services.residual_due_service import get_residual_due_service

router = APIRouter(tags=["riders"])


@router.get("/{rider_id}/recovery-state", response_model=RecoveryStateResponse)
def get_recovery_state(rider_id: str) -> RecoveryStateResponse:
    return RecoveryStateResponse.model_validate(get_recovery_service().recovery_state(rider_id))


@router.get("/{rider_id}/rebooking-eligibility", response_model=RebookingStateResponse)
def get_rebooking_eligibility(rider_id: str) -> RebookingStateResponse:
    state = get_residual_due_service().rebooking_state(rider_id)
    return RebookingStateResponse(
        assured_pay_eligible=state.assured_pay_eligible,
        standard_ride_allowed=state.standard_ride_allowed,
        restriction=state.restriction.value,
        grace_active=state.grace_active,
        unpaid_past_grace_count=state.unpaid_past_grace_count,
        open_due_count=state.open_due_count,
    )
