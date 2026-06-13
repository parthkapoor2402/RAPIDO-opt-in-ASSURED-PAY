"""Validator tests for Grok output (P14)."""

from app.services.grok.validator import allowed_amounts, validate_explanation


def test_validate_accepts_matching_amounts() -> None:
    allowed = allowed_amounts(49, 46, 3)
    assert validate_explanation("You were charged ₹49 and fare is ₹46.", allowed) is True


def test_validate_rejects_invented_amounts() -> None:
    allowed = allowed_amounts(49, 46)
    assert validate_explanation("You owe ₹999 extra.", allowed) is False
