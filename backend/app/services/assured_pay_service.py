"""Assured Pay eligibility and authorization (in-memory MVP seed)."""

from app.core.config import Settings
from app.domain.eligibility import RiderProfile, is_eligible, valid_reason_code_labels
from app.domain.fare import compute_approved_max
from app.schemas.assured_pay import (
    AuthorizeRequest,
    AuthorizeResponse,
    DiscoveryPromptResponse,
    EligibilityResponse,
)
from app.services.discovery_service import DiscoveryContext, resolve_discovery_prompts
from app.services.residual_due_service import get_residual_due_service

# Demo rider profiles aligned with frontend demo scenarios (DEC-020)
RIDER_PROFILES: dict[str, RiderProfile] = {
    "rider_commuter": RiderProfile(
        rider_id="rider_commuter",
        free_trial_available=True,
        online_payment_ride_count=3,
        has_payment_instrument=True,
    ),
    "rider_arjun": RiderProfile(
        rider_id="rider_arjun",
        prior_payment_failure=True,
        free_trial_available=False,
        has_payment_instrument=True,
    ),
    "rider_blocked": RiderProfile(
        rider_id="rider_blocked",
        has_open_residual=True,
        has_payment_instrument=True,
    ),
}

DEFAULT_ESTIMATE_F = 42
_authorizations: dict[str, dict] = {}


def get_rider_profile(rider_id: str) -> RiderProfile:
    return RIDER_PROFILES.get(
        rider_id,
        RiderProfile(rider_id=rider_id, free_trial_available=True),
    )


def get_eligibility(
    rider_id: str,
    settings: Settings,
    *,
    payment_method: str = "cash",
    battery_level: float | None = None,
    battery_low_override: bool = False,
    estimate_f: int = DEFAULT_ESTIMATE_F,
) -> EligibilityResponse:
    profile = get_rider_profile(rider_id)
    open_dues = get_residual_due_service().get_open_for_rider(rider_id)
    effective = RiderProfile(
        rider_id=profile.rider_id,
        has_open_residual=profile.has_open_residual or len(open_dues) > 0,
        has_payment_instrument=profile.has_payment_instrument,
        prior_payment_failure=profile.prior_payment_failure,
        free_trial_available=profile.free_trial_available,
        online_payment_ride_count=profile.online_payment_ride_count,
    )
    eligible, block_reasons = is_eligible(effective)
    buffer = settings.buffer_amount_inr
    m = compute_approved_max(estimate_f, buffer)

    ctx = DiscoveryContext(
        battery_level=battery_level,
        battery_low_override=battery_low_override,
        payment_method=payment_method,
    )
    prompts = resolve_discovery_prompts(profile, ctx, eligible=eligible)

    return EligibilityResponse(
        eligible=eligible,
        block_reasons=block_reasons,
        F=estimate_f,
        buffer=buffer,
        M=m,
        free_trial_available=effective.free_trial_available and eligible,
        valid_reason_codes=valid_reason_code_labels(),
        has_payment_instrument=effective.has_payment_instrument,
        prompts=[DiscoveryPromptResponse.model_validate(p.__dict__) for p in prompts],
    )


def authorize_opt_in(
    rider_id: str,
    settings: Settings,
    body: AuthorizeRequest,
    *,
    estimate_f: int = DEFAULT_ESTIMATE_F,
) -> AuthorizeResponse:
    profile = get_rider_profile(rider_id)
    open_dues = get_residual_due_service().get_open_for_rider(rider_id)
    effective = RiderProfile(
        rider_id=profile.rider_id,
        has_open_residual=profile.has_open_residual or len(open_dues) > 0,
        has_payment_instrument=profile.has_payment_instrument,
        prior_payment_failure=profile.prior_payment_failure,
        free_trial_available=profile.free_trial_available,
        online_payment_ride_count=profile.online_payment_ride_count,
    )
    eligible, block_reasons = is_eligible(effective)
    if not eligible:
        return AuthorizeResponse(
            authorized=False,
            authorization_id="",
            M=0,
            free_trial_applied=False,
            message=f"Not eligible: {', '.join(block_reasons)}",
        )
    if not body.consent:
        return AuthorizeResponse(
            authorized=False,
            authorization_id="",
            M=0,
            free_trial_applied=False,
            message="Consent required",
        )

    m = compute_approved_max(estimate_f, settings.buffer_amount_inr)
    auth_id = f"auth_{rider_id}_{body.ride_id}"
    free_trial = profile.free_trial_available
    _authorizations[auth_id] = {
        "rider_id": rider_id,
        "ride_id": body.ride_id,
        "M": m,
        "discovery_source": body.discovery_source,
        "free_trial_applied": free_trial,
    }
    if free_trial and rider_id in RIDER_PROFILES:
        # Consume trial in-memory for demo
        RIDER_PROFILES[rider_id] = RiderProfile(
            **{**profile.__dict__, "free_trial_available": False},
        )

    return AuthorizeResponse(
        authorized=True,
        authorization_id=auth_id,
        M=m,
        free_trial_applied=free_trial,
        message="Assured Pay enabled. Captain payout guaranteed up to your approved max.",
    )
