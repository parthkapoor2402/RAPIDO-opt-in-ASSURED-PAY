"""Analytics aggregation service with demo seed events (P09)."""

from datetime import UTC, datetime, timedelta

from app.domain.analytics_events import AnalyticsEventType
from app.domain.models.analytics_event import AnalyticsEvent
from app.services.analytics_aggregation import KpiSummary, compute_kpi_summary


def _ts(days_ago: int = 0) -> str:
    return (datetime.now(UTC) - timedelta(days=days_ago)).isoformat()


def _build_healthy_events() -> list[dict]:
    events: list[dict] = []
    for i in range(120):
        events.append(
            {
                "event_type": AnalyticsEventType.ASSURED_PAY_IMPRESSION.value,
                "ride_id": None,
                "rider_id": f"rider_{i % 40}",
                "scenario": "healthy",
                "timestamp": _ts(i % 14),
            }
        )
    for i in range(48):
        events.append(
            {
                "event_type": AnalyticsEventType.ASSURED_PAY_OPT_IN.value,
                "ride_id": f"ride_{i}",
                "rider_id": f"rider_{i % 30}",
                "scenario": "healthy",
                "timestamp": _ts(i % 10),
            }
        )
    for i in range(42):
        events.append(
            {
                "event_type": AnalyticsEventType.RIDE_AUTO_PAID.value,
                "ride_id": f"ride_{i}",
                "rider_id": f"rider_{i % 30}",
                "amount_inr": 42 + (i % 5),
                "scenario": "healthy",
                "timestamp": _ts(i % 7),
            }
        )
        events.append(
            {
                "event_type": AnalyticsEventType.CAPTAIN_FULLY_CREDITED.value,
                "ride_id": f"ride_{i}",
                "rider_id": f"rider_{i % 30}",
                "amount_inr": 42 + (i % 5),
                "scenario": "healthy",
                "timestamp": _ts(i % 7),
            }
        )
    for i in range(12):
        events.append(
            {
                "event_type": AnalyticsEventType.FARE_ENTERED_BUFFER.value,
                "ride_id": f"ride_buf_{i}",
                "rider_id": f"rider_{i % 20}",
                "scenario": "healthy",
                "timestamp": _ts(i % 5),
            }
        )
    for i in range(6):
        events.append(
            {
                "event_type": AnalyticsEventType.RESIDUAL_DUE_CREATED.value,
                "ride_id": f"ride_res_{i}",
                "rider_id": f"rider_{i % 15}",
                "amount_inr": 3,
                "scenario": "healthy",
                "timestamp": _ts(i % 4),
            }
        )
        events.append(
            {
                "event_type": AnalyticsEventType.CAPTAIN_FULLY_CREDITED.value,
                "ride_id": f"ride_res_{i}",
                "rider_id": f"rider_{i % 15}",
                "amount_inr": 52,
                "scenario": "healthy",
                "timestamp": _ts(i % 4),
            }
        )
    for i in range(5):
        events.append(
            {
                "event_type": AnalyticsEventType.RESIDUAL_DUE_RECOVERED.value,
                "ride_id": f"ride_res_{i}",
                "rider_id": f"rider_{i % 15}",
                "amount_inr": 3,
                "scenario": "healthy",
                "timestamp": _ts(i % 3),
            }
        )
    events.append(
        {
            "event_type": AnalyticsEventType.RESIDUAL_DUE_DISPUTED.value,
            "ride_id": "ride_res_5",
            "rider_id": "rider_5",
            "amount_inr": 3,
            "scenario": "healthy",
            "timestamp": _ts(2),
        }
    )
    for rider in ("rider_commuter", "rider_arjun", "rider_1", "rider_2", "rider_3"):
        for j in range(2):
            events.append(
                {
                    "event_type": AnalyticsEventType.ASSURED_PAY_OPT_IN.value,
                    "ride_id": f"ride_repeat_{rider}_{j}",
                    "rider_id": rider,
                    "scenario": "healthy",
                    "timestamp": _ts(j),
                }
            )
    return events


def _build_stressed_events() -> list[dict]:
    events: list[dict] = []
    for i in range(80):
        events.append(
            {
                "event_type": AnalyticsEventType.ASSURED_PAY_IMPRESSION.value,
                "ride_id": None,
                "rider_id": f"rider_s_{i % 25}",
                "scenario": "stressed",
                "timestamp": _ts(i % 14),
            }
        )
    for i in range(28):
        events.append(
            {
                "event_type": AnalyticsEventType.ASSURED_PAY_OPT_IN.value,
                "ride_id": f"ride_s_{i}",
                "rider_id": f"rider_s_{i % 20}",
                "scenario": "stressed",
                "timestamp": _ts(i % 10),
            }
        )
    for i in range(20):
        events.append(
            {
                "event_type": AnalyticsEventType.RIDE_AUTO_PAID.value,
                "ride_id": f"ride_s_{i}",
                "rider_id": f"rider_s_{i % 20}",
                "scenario": "stressed",
                "timestamp": _ts(i % 7),
            }
        )
        events.append(
            {
                "event_type": AnalyticsEventType.CAPTAIN_FULLY_CREDITED.value,
                "ride_id": f"ride_s_{i}",
                "rider_id": f"rider_s_{i % 20}",
                "scenario": "stressed",
                "timestamp": _ts(i % 7),
            }
        )
    for i in range(12):
        events.append(
            {
                "event_type": AnalyticsEventType.RESIDUAL_DUE_CREATED.value,
                "ride_id": f"ride_s_res_{i}",
                "rider_id": f"rider_s_{i % 12}",
                "amount_inr": 3 + (i % 3),
                "scenario": "stressed",
                "timestamp": _ts(i % 5),
            }
        )
        events.append(
            {
                "event_type": AnalyticsEventType.CAPTAIN_FULLY_CREDITED.value,
                "ride_id": f"ride_s_res_{i}",
                "rider_id": f"rider_s_{i % 12}",
                "amount_inr": 55,
                "scenario": "stressed",
                "timestamp": _ts(i % 5),
            }
        )
    for i in range(4):
        events.append(
            {
                "event_type": AnalyticsEventType.RESIDUAL_DUE_RECOVERED.value,
                "ride_id": f"ride_s_res_{i}",
                "rider_id": f"rider_s_{i % 12}",
                "amount_inr": 3,
                "scenario": "stressed",
                "timestamp": _ts(i % 3),
            }
        )
    for i in range(5, 12):
        events.append(
            {
                "event_type": AnalyticsEventType.RESIDUAL_DUE_DISPUTED.value,
                "ride_id": f"ride_s_res_{i}",
                "rider_id": f"rider_s_{i % 12}",
                "amount_inr": 3,
                "scenario": "stressed",
                "timestamp": _ts(i % 2),
            }
        )
    return events


class AnalyticsService:
    def __init__(self) -> None:
        self._events: list[dict] = _build_healthy_events() + _build_stressed_events()

    def list_events(self, scenario: str = "all") -> list[AnalyticsEvent]:
        filtered = self._filter(scenario)
        return [
            AnalyticsEvent(
                event_type=e["event_type"],
                ride_id=e.get("ride_id"),
                rider_id=e.get("rider_id"),
                amount_inr=e.get("amount_inr"),
                scenario=e.get("scenario", "all"),
                timestamp=e.get("timestamp", _ts()),
                metadata={
                    k: v
                    for k, v in e.items()
                    if k
                    not in {
                        "event_type",
                        "ride_id",
                        "rider_id",
                        "amount_inr",
                        "scenario",
                        "timestamp",
                    }
                },
            )
            for e in filtered
        ]

    def get_summary(self, scenario: str = "all") -> KpiSummary:
        filtered = self._filter(scenario)
        return compute_kpi_summary(filtered, scenario=scenario)

    def _filter(self, scenario: str) -> list[dict]:
        if scenario == "all":
            return self._events
        return [e for e in self._events if e.get("scenario") == scenario]


_default_service: AnalyticsService | None = None


def get_analytics_service() -> AnalyticsService:
    global _default_service
    if _default_service is None:
        _default_service = AnalyticsService()
    return _default_service
