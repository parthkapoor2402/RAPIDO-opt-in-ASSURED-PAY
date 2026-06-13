"""Support review queue API (P08)."""

from fastapi import APIRouter, HTTPException

from app.schemas.common import PlaceholderResponse
from app.schemas.recovery import ReviewCaseResponse, ReviewQueueResponse, ReviewResolveRequest
from app.services.support_service import get_support_service

router = APIRouter(tags=["support"])


@router.get("", response_model=PlaceholderResponse, include_in_schema=False)
def support_stub() -> PlaceholderResponse:
    return PlaceholderResponse(module="support")


def _case_response(case) -> ReviewCaseResponse:
    return ReviewCaseResponse(
        id=case.id,
        ride_id=case.ride_id,
        rider_id=case.rider_id,
        captain_id=case.captain_id,
        approved_m=case.approved_m,
        actual_a=case.actual_a,
        excess_inr=case.excess_inr,
        reason_codes=case.reason_codes,
        state=case.state.value,
    )


@router.get("/review-queue", response_model=ReviewQueueResponse)
def review_queue() -> ReviewQueueResponse:
    cases = get_support_service().list_review_queue()
    responses = [_case_response(case) for case in cases]
    return ReviewQueueResponse(cases=responses, pending_count=len(responses))


@router.get("/review/{case_id}", response_model=ReviewCaseResponse)
def get_review_case(case_id: str) -> ReviewCaseResponse:
    case = get_support_service().get_case(case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Review case not found")
    return _case_response(case)


@router.post("/review/{case_id}/resolve", response_model=ReviewCaseResponse)
def resolve_review_case(case_id: str, body: ReviewResolveRequest) -> ReviewCaseResponse:
    try:
        case = get_support_service().resolve_case(case_id, resolution=body.resolution)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return _case_response(case)
