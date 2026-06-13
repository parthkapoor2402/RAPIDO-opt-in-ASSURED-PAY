import pytest

from app.domain.enums import FareState, OverageClassification, PayoutState, ReasonCode, ReviewState


@pytest.mark.parametrize(
    ("enum_cls", "expected_members"),
    [
        (
            ReasonCode,
            {
                "WAITING_AFTER_ARRIVAL",
                "RIDER_REQUESTED_ROUTE_CHANGE",
                "PICKUP_CORRECTION",
                "TOLL",
                "UNKNOWN_REVIEW_REQUIRED",
            },
        ),
        (
            FareState,
            {"WITHIN_ESTIMATE", "IN_BUFFER", "EXCEEDS_MAX"},
        ),
        (
            OverageClassification,
            {"NONE", "SMALL_VALID", "SUSPICIOUS_LARGE"},
        ),
        (
            PayoutState,
            {"PENDING", "CREDITED", "PARTIAL", "HELD", "FAILED"},
        ),
        (
            ReviewState,
            {"PENDING", "IN_REVIEW", "APPROVED", "DENIED", "RESOLVED"},
        ),
    ],
)
def test_enum_members_match_contract(enum_cls: type, expected_members: set[str]) -> None:
    actual_members = {member.name for member in enum_cls}
    assert actual_members == expected_members


@pytest.mark.parametrize(
    "enum_cls",
    [ReasonCode, FareState, OverageClassification, PayoutState, ReviewState],
)
def test_enum_values_are_lowercase_strings(enum_cls: type) -> None:
    for member in enum_cls:
        assert isinstance(member.value, str)
        assert member.value == member.value.lower()


@pytest.mark.parametrize(
    ("enum_cls", "sample_value"),
    [
        (ReasonCode, "waiting_after_arrival"),
        (FareState, "within_estimate"),
        (OverageClassification, "small_valid"),
        (PayoutState, "credited"),
        (ReviewState, "pending"),
    ],
)
def test_enum_constructible_from_value(enum_cls: type, sample_value: str) -> None:
    assert enum_cls(sample_value) in enum_cls
