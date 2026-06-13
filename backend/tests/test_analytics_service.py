"""Analytics metric aggregation tests (P09)."""

import pytest

from app.domain.analytics_events import AnalyticsEventType
from app.services.analytics_service import AnalyticsService, compute_kpi_summary


@pytest.fixture
def service() -> AnalyticsService:
    return AnalyticsService()


class TestMetricAggregation:
    def test_facr_from_seed_events(self, service: AnalyticsService) -> None:
        summary = service.get_summary()
        assert 0 <= summary.frictionless_completion_rate <= 100
        assert summary.frictionless_completion_rate > 0

    def test_captain_payout_success_rate(self, service: AnalyticsService) -> None:
        summary = service.get_summary()
        assert summary.captain_payout_success_rate >= 90

    def test_residual_recovery_rate(self, service: AnalyticsService) -> None:
        summary = service.get_summary()
        assert 0 <= summary.residual_recovery_rate <= 100

    def test_dispute_rate(self, service: AnalyticsService) -> None:
        summary = service.get_summary()
        assert summary.dispute_rate >= 0

    def test_bad_debt_estimate_inr(self, service: AnalyticsService) -> None:
        summary = service.get_summary()
        assert summary.bad_debt_estimate_inr >= 0

    def test_repeat_assured_pay_usage_rate(self, service: AnalyticsService) -> None:
        summary = service.get_summary()
        assert 0 <= summary.repeat_assured_pay_usage_rate <= 100


class TestScenarioFilter:
    def test_healthy_scenario_higher_facr(self, service: AnalyticsService) -> None:
        healthy = service.get_summary(scenario="healthy")
        stressed = service.get_summary(scenario="stressed")
        assert healthy.frictionless_completion_rate >= stressed.frictionless_completion_rate

    def test_stressed_scenario_higher_dispute_rate(self, service: AnalyticsService) -> None:
        healthy = service.get_summary(scenario="healthy")
        stressed = service.get_summary(scenario="stressed")
        assert stressed.dispute_rate >= healthy.dispute_rate


class TestComputeHelpers:
    def test_compute_facr(self) -> None:
        events = [
            {"event_type": AnalyticsEventType.RIDE_AUTO_PAID.value, "ride_id": "r1"},
            {"event_type": AnalyticsEventType.RIDE_AUTO_PAID.value, "ride_id": "r2"},
            {"event_type": AnalyticsEventType.RESIDUAL_DUE_CREATED.value, "ride_id": "r3"},
        ]
        rate = compute_kpi_summary(events, scenario="all").frictionless_completion_rate
        assert rate == pytest.approx(66.67, rel=0.01)

    def test_event_type_enum_values(self) -> None:
        assert AnalyticsEventType.ASSURED_PAY_IMPRESSION.value == "assured_pay_impression"
        assert AnalyticsEventType.RESIDUAL_DUE_DISPUTED.value == "residual_due_disputed"
