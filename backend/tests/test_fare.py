import pytest

from app.domain.fare import compute_approved_max


@pytest.mark.parametrize(
    ("estimate_f", "buffer", "expected_m"),
    [
        (42, 7, 49),
        (0, 7, 7),
        (100, 7, 107),
    ],
)
def test_compute_approved_max(estimate_f: int, buffer: int, expected_m: int) -> None:
    assert compute_approved_max(estimate_f, buffer) == expected_m


def test_compute_approved_max_rejects_negative() -> None:
    with pytest.raises(ValueError):
        compute_approved_max(-1, 7)
