"""Grok adapter tests — no-key, success, and failure paths (P14)."""

from unittest.mock import MagicMock, patch

import pytest

from app.core.config import Settings
from app.services.grok.adapter import GrokAdapter, GrokApiError
from app.services.grok.explanation_service import ExplanationService
from app.services.grok.fallbacks import (
    explain_dispute_summary_fallback,
    explain_fare_change_fallback,
    explain_pending_due_fallback,
)


@pytest.fixture
def disabled_settings() -> Settings:
    return Settings(grok_copy_enabled=False, grok_api_key="")


@pytest.fixture
def enabled_settings() -> Settings:
    return Settings(grok_copy_enabled=True, grok_api_key="test-key")


class TestGrokAdapterNoKey:
    def test_not_available_without_key(self, disabled_settings: Settings) -> None:
        adapter = GrokAdapter(disabled_settings)
        assert adapter.is_available is False

    def test_call_raises_when_unavailable(self, disabled_settings: Settings) -> None:
        adapter = GrokAdapter(disabled_settings)
        with pytest.raises(GrokApiError, match="not configured"):
            adapter.complete("user prompt")


class TestGrokAdapterSuccess:
    def test_complete_returns_content(self, enabled_settings: Settings) -> None:
        adapter = GrokAdapter(enabled_settings)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Your fare moved into the buffer zone."}}],
        }
        mock_response.raise_for_status = MagicMock()
        with patch("httpx.post", return_value=mock_response) as post:
            text = adapter.complete("user prompt")
        assert "buffer zone" in text
        post.assert_called_once()


class TestGrokAdapterFailure:
    def test_http_error_raises(self, enabled_settings: Settings) -> None:
        adapter = GrokAdapter(enabled_settings)
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = Exception("server error")
        with patch("httpx.post", return_value=mock_response):
            with pytest.raises(GrokApiError):
                adapter.complete("user prompt")


class TestExplanationServiceFallback:
    def test_fare_uses_fallback_when_disabled(self, disabled_settings: Settings) -> None:
        service = ExplanationService(disabled_settings)
        result = service.explain_fare_change(
            estimate_f=42,
            approved_m=49,
            buffer=7,
            current_fare=46,
            reason_label="Waiting after arrival",
        )
        assert result.source == "fallback"
        assert "₹49" in result.text
        assert result.grok_available is False

    def test_due_uses_fallback_on_api_failure(self, enabled_settings: Settings) -> None:
        service = ExplanationService(enabled_settings)
        with patch.object(GrokAdapter, "complete", side_effect=GrokApiError("fail")):
            result = service.explain_pending_due(
                amount_inr=3,
                approved_m=49,
                actual_a=52,
                reason_label="Waiting after arrival",
            )
        assert result.source == "fallback"
        assert "₹3" in result.text

    def test_dispute_summary_fallback(self) -> None:
        text = explain_dispute_summary_fallback(
            ride_id="ride_1",
            approved_m=49,
            actual_a=80,
            excess_inr=31,
            reason_codes=[],
        )
        assert "ride_1" in text
        assert "₹31" in text


class TestFallbackTemplates:
    def test_fare_fallback_mentions_approved_max(self) -> None:
        text = explain_fare_change_fallback(
            estimate_f=42,
            approved_m=49,
            buffer=7,
            current_fare=46,
            reason_label="Waiting after arrival",
        )
        assert "approved up to" in text.lower()
        assert "₹46" in text

    def test_due_fallback_non_shaming(self) -> None:
        text = explain_pending_due_fallback(
            amount_inr=3,
            approved_m=49,
            actual_a=52,
            reason_label="Waiting after arrival",
        )
        assert "captain" in text.lower()
        assert "₹3" in text
