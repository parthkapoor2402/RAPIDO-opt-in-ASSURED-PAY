"""Validate Grok output — reject invented amounts (P14)."""

import re

_AMOUNT_PATTERN = re.compile(r"₹\s*(\d+)")


def allowed_amounts(*values: int | None) -> set[str]:
    return {str(v) for v in values if v is not None}


def validate_explanation(text: str, allowed: set[str]) -> bool:
    """Return False if text mentions ₹ amounts not in the allowed set."""
    if not text.strip():
        return False
    mentioned = _AMOUNT_PATTERN.findall(text)
    if not mentioned:
        return True
    return all(amount in allowed for amount in mentioned)
