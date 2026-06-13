"""Assistive explanation API schemas (P14)."""

from pydantic import BaseModel, Field


class AssistStatusResponse(BaseModel):
    grok_enabled: bool
    grok_configured: bool
    message: str


class ExplanationResponse(BaseModel):
    text: str
    source: str
    use_case: str
    grok_available: bool


class FareExplainRequest(BaseModel):
    estimate_f: int = Field(ge=0)
    approved_m: int = Field(ge=0)
    buffer: int = Field(ge=0)
    current_fare: int = Field(ge=0)
    reason_label: str | None = None


class DueExplainRequest(BaseModel):
    amount_inr: int = Field(ge=0)
    approved_m: int = Field(ge=0)
    actual_a: int = Field(ge=0)
    reason_label: str = Field(min_length=1)


class DisputeExplainRequest(BaseModel):
    ride_id: str
    approved_m: int = Field(ge=0)
    actual_a: int = Field(ge=0)
    excess_inr: int = Field(ge=0)
    reason_codes: list[str] = Field(default_factory=list)
    rider_note: str | None = None
