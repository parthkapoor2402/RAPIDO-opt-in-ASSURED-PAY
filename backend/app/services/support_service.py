"""Support review queue service (P08)."""

from datetime import UTC, datetime

from app.domain.enums import ReviewState
from app.domain.models.review_case import ReviewCase
from app.services.settlement_service import get_settlement_service


class SupportService:
    def __init__(self) -> None:
        self._cases: dict[str, ReviewCase] = {}

    def sync_from_settlement(self, ride_id: str) -> ReviewCase | None:
        settlement = get_settlement_service().get_by_ride_id(ride_id)
        if settlement is None or settlement.review_case_id is None:
            return None
        case_id = settlement.review_case_id
        if case_id in self._cases:
            return self._cases[case_id]
        case = ReviewCase(
            id=case_id,
            ride_id=settlement.ride_id,
            rider_id=settlement.rider_id,
            captain_id=settlement.captain_id,
            approved_m=settlement.approved_m,
            actual_a=settlement.actual_a,
            excess_inr=settlement.actual_a - settlement.approved_m,
            reason_codes=[],
            state=ReviewState.PENDING,
            created_at=datetime.now(UTC),
        )
        self._cases[case_id] = case
        return case

    def list_review_queue(self) -> list[ReviewCase]:
        service = get_settlement_service()
        for ride_id in list(getattr(service, "_by_ride_id", {}).keys()):
            self.sync_from_settlement(ride_id)
        return [
            case
            for case in self._cases.values()
            if case.state in {ReviewState.PENDING, ReviewState.IN_REVIEW}
        ]

    def get_case(self, case_id: str) -> ReviewCase | None:
        return self._cases.get(case_id)

    def resolve_case(self, case_id: str, *, resolution: str) -> ReviewCase:
        case = self._cases.get(case_id)
        if case is None:
            raise ValueError("case not found")
        case.state = ReviewState.RESOLVED
        return case


_default_service: SupportService | None = None


def get_support_service() -> SupportService:
    global _default_service
    if _default_service is None:
        _default_service = SupportService()
    return _default_service
