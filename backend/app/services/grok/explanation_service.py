"""Assistive explanation orchestration — Grok optional, fallback always (P14)."""

from dataclasses import dataclass

from app.core.config import Settings, get_settings
from app.services.grok.adapter import GrokAdapter, GrokApiError
from app.services.grok.fallbacks import (
    explain_dispute_summary_fallback,
    explain_fare_change_fallback,
    explain_pending_due_fallback,
)
from app.services.grok.validator import allowed_amounts, validate_explanation


@dataclass(frozen=True)
class ExplanationResult:
    text: str
    source: str
    use_case: str
    grok_available: bool


class ExplanationService:
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._adapter = GrokAdapter(self._settings)

    @property
    def grok_available(self) -> bool:
        return self._adapter.is_available

    def explain_fare_change(
        self,
        *,
        estimate_f: int,
        approved_m: int,
        buffer: int,
        current_fare: int,
        reason_label: str | None,
    ) -> ExplanationResult:
        fallback = explain_fare_change_fallback(
            estimate_f=estimate_f,
            approved_m=approved_m,
            buffer=buffer,
            current_fare=current_fare,
            reason_label=reason_label,
        )
        allowed = allowed_amounts(estimate_f, approved_m, buffer, current_fare)
        prompt = (
            f"Explain this in-rider fare update: estimate ₹{estimate_f}, approved max ₹{approved_m}, "
            f"buffer ₹{buffer}, current ₹{current_fare}, reason: {reason_label or 'none'}."
        )
        return self._resolve("fare_change", prompt, fallback, allowed)

    def explain_pending_due(
        self,
        *,
        amount_inr: int,
        approved_m: int,
        actual_a: int,
        reason_label: str,
    ) -> ExplanationResult:
        fallback = explain_pending_due_fallback(
            amount_inr=amount_inr,
            approved_m=approved_m,
            actual_a=actual_a,
            reason_label=reason_label,
        )
        allowed = allowed_amounts(amount_inr, approved_m, actual_a)
        prompt = (
            f"Explain why rider owes ₹{amount_inr} after trip: charged ₹{approved_m} at end, "
            f"final fare ₹{actual_a}, reason: {reason_label}."
        )
        return self._resolve("pending_due", prompt, fallback, allowed)

    def explain_dispute_summary(
        self,
        *,
        ride_id: str,
        approved_m: int,
        actual_a: int,
        excess_inr: int,
        reason_codes: list[str],
        rider_note: str | None = None,
    ) -> ExplanationResult:
        fallback = explain_dispute_summary_fallback(
            ride_id=ride_id,
            approved_m=approved_m,
            actual_a=actual_a,
            excess_inr=excess_inr,
            reason_codes=reason_codes,
            rider_note=rider_note,
        )
        allowed = allowed_amounts(approved_m, actual_a, excess_inr)
        prompt = (
            f"Summarize for support reviewer: ride {ride_id}, approved ₹{approved_m}, "
            f"final ₹{actual_a}, excess ₹{excess_inr}, codes {reason_codes}, note: {rider_note or 'none'}."
        )
        return self._resolve("dispute_summary", prompt, fallback, allowed)

    def _resolve(
        self,
        use_case: str,
        prompt: str,
        fallback: str,
        allowed: set[str],
    ) -> ExplanationResult:
        if not self._adapter.is_available:
            return ExplanationResult(
                text=fallback,
                source="fallback",
                use_case=use_case,
                grok_available=False,
            )
        try:
            generated = self._adapter.complete(prompt)
            if validate_explanation(generated, allowed):
                return ExplanationResult(
                    text=generated,
                    source="grok",
                    use_case=use_case,
                    grok_available=True,
                )
        except GrokApiError:
            pass
        return ExplanationResult(
            text=fallback,
            source="fallback",
            use_case=use_case,
            grok_available=self._adapter.is_available,
        )


def get_explanation_service() -> ExplanationService:
    return ExplanationService()
