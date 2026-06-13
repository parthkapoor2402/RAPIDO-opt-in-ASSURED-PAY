from pydantic import BaseModel, Field


class DiscoveryPromptResponse(BaseModel):
    id: str
    show: bool
    headline: str
    subline: str
    priority: int


class EligibilityResponse(BaseModel):
    eligible: bool
    block_reasons: list[str] = Field(default_factory=list)
    F: int
    buffer: int
    M: int
    free_trial_available: bool
    valid_reason_codes: list[str]
    has_payment_instrument: bool
    prompts: list[DiscoveryPromptResponse]


class AuthorizeRequest(BaseModel):
    ride_id: str
    payment_instrument_id: str = "default"
    discovery_source: str
    consent: bool = True


class AuthorizeResponse(BaseModel):
    authorized: bool
    authorization_id: str
    M: int
    free_trial_applied: bool
    message: str
