"""Contextual discovery prompts for Assured Pay (P05)."""

from dataclasses import dataclass

from app.domain.eligibility import RiderProfile


@dataclass(frozen=True)
class DiscoveryContext:
    battery_level: float | None = None
    battery_low_override: bool = False
    payment_method: str = "cash"
    online_payment_threshold: int = 2


@dataclass(frozen=True)
class DiscoveryPrompt:
    id: str
    show: bool
    headline: str
    subline: str
    priority: int


def _battery_low(ctx: DiscoveryContext) -> bool:
    if ctx.battery_low_override:
        return True
    if ctx.battery_level is not None and ctx.battery_level < 0.2:
        return True
    return False


def resolve_discovery_prompts(
    profile: RiderProfile,
    ctx: DiscoveryContext,
    *,
    eligible: bool,
) -> list[DiscoveryPrompt]:
    """Build ordered discovery prompts; booking card always shown when eligible."""
    prompts: list[DiscoveryPrompt] = []

    if eligible:
        prompts.append(
            DiscoveryPrompt(
                id="booking_card",
                show=True,
                headline="Finish without payment stress",
                subline="Guaranteed digital completion up to your approved max.",
                priority=10,
            )
        )

    if eligible and profile.free_trial_available:
        prompts.append(
            DiscoveryPrompt(
                id="free_trial",
                show=True,
                headline="First assured bike ride free",
                subline="Try Assured Pay on this ride — no extra charge for protection.",
                priority=5,
            )
        )

    if eligible and _battery_low(ctx):
        prompts.append(
            DiscoveryPrompt(
                id="low_battery",
                show=True,
                headline="Low battery?",
                subline="Turn on Assured Pay for a frictionless drop-off.",
                priority=1,
            )
        )

    if eligible and ctx.payment_method in {"upi", "card"}:
        prompts.append(
            DiscoveryPrompt(
                id="online_payer",
                show=True,
                headline="Prefer digital payment?",
                subline="Assured Pay covers weak network and payment failures at drop-off.",
                priority=2,
            )
        )
    elif (
        eligible
        and profile.online_payment_ride_count >= ctx.online_payment_threshold
    ):
        prompts.append(
            DiscoveryPrompt(
                id="online_payer",
                show=True,
                headline="Finish your ride without payment stress",
                subline="You often pay digitally — Assured Pay has your back at drop-off.",
                priority=3,
            )
        )

    if eligible and profile.prior_payment_failure:
        prompts.append(
            DiscoveryPrompt(
                id="post_failure",
                show=True,
                headline="Avoid payment hassle next time",
                subline="Your last ride had a payment issue — Assured Pay prevents a repeat.",
                priority=1,
            )
        )

    return sorted(prompts, key=lambda p: p.priority)


def primary_prompt(prompts: list[DiscoveryPrompt]) -> DiscoveryPrompt | None:
    visible = [p for p in prompts if p.show]
    if not visible:
        return None
    return min(visible, key=lambda p: p.priority)
