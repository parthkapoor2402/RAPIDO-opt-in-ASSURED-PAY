from app.domain.eligibility import RiderProfile
from app.services.discovery_service import (
    DiscoveryContext,
    primary_prompt,
    resolve_discovery_prompts,
)


def test_low_battery_prompt_when_battery_below_threshold() -> None:
    profile = RiderProfile(rider_id="r1", free_trial_available=False)
    ctx = DiscoveryContext(battery_level=0.15, payment_method="cash")
    prompts = resolve_discovery_prompts(profile, ctx, eligible=True)
    ids = {p.id for p in prompts if p.show}
    assert "low_battery" in ids
    assert primary_prompt(prompts) is not None
    assert primary_prompt(prompts).id == "low_battery"


def test_online_payer_prompt_when_upi_selected() -> None:
    profile = RiderProfile(rider_id="r1")
    ctx = DiscoveryContext(payment_method="upi", battery_level=0.9)
    prompts = resolve_discovery_prompts(profile, ctx, eligible=True)
    assert any(p.id == "online_payer" and p.show for p in prompts)


def test_post_failure_prompt_for_rider_with_prior_failure() -> None:
    profile = RiderProfile(rider_id="r1", prior_payment_failure=True)
    ctx = DiscoveryContext(payment_method="cash", battery_level=0.9)
    prompts = resolve_discovery_prompts(profile, ctx, eligible=True)
    assert any(p.id == "post_failure" and p.show for p in prompts)


def test_free_trial_prompt_when_available() -> None:
    profile = RiderProfile(rider_id="r1", free_trial_available=True)
    ctx = DiscoveryContext(payment_method="cash", battery_level=0.9)
    prompts = resolve_discovery_prompts(profile, ctx, eligible=True)
    assert any(p.id == "free_trial" and p.show for p in prompts)


def test_no_prompts_when_ineligible() -> None:
    profile = RiderProfile(rider_id="blocked", has_open_residual=True)
    ctx = DiscoveryContext(payment_method="upi")
    prompts = resolve_discovery_prompts(profile, ctx, eligible=False)
    assert prompts == []
