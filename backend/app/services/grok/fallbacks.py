"""Static fallback explanations — deterministic, never make decisions (P14)."""


def explain_fare_change_fallback(
    *,
    estimate_f: int,
    approved_m: int,
    buffer: int,
    current_fare: int,
    reason_label: str | None,
) -> str:
    reason_part = (
        f" The latest update is tagged as “{reason_label}”, which is a valid reason Assured Pay covers."
        if reason_label
        else ""
    )
    if current_fare <= approved_m:
        zone = (
            "still within your approved max"
            if current_fare <= estimate_f
            else "inside the small buffer above your estimate"
        )
    else:
        zone = "above your approved max — settlement rules (not this message) decide what happens at trip end"
    return (
        f"Your trip started with an estimate of ₹{estimate_f}. Assured Pay approved up to ₹{approved_m} "
        f"(estimate plus ₹{buffer} buffer). The fare is now ₹{current_fare}, which is {zone}.{reason_part} "
        "This summary is for clarity only — payment outcomes follow fixed policy."
    )


def explain_pending_due_fallback(
    *,
    amount_inr: int,
    approved_m: int,
    actual_a: int,
    reason_label: str,
) -> str:
    return (
        f"At trip end we charged ₹{approved_m}, your approved max. The final fare was ₹{actual_a} because of "
        f"“{reason_label}”. Your captain was credited the full ride amount per policy. "
        f"The remaining ₹{amount_inr} is a small balance you can clear when ready — it does not affect standard booking."
    )


def explain_dispute_summary_fallback(
    *,
    ride_id: str,
    approved_m: int,
    actual_a: int,
    excess_inr: int,
    reason_codes: list[str],
    rider_note: str | None = None,
) -> str:
    reasons = ", ".join(reason_codes) if reason_codes else "none recorded"
    note = f" Rider note: “{rider_note}”." if rider_note else ""
    return (
        f"Case {ride_id}: final fare ₹{actual_a} vs approved max ₹{approved_m} (+₹{excess_inr}). "
        f"Reason codes on file: {reasons}.{note} "
        "Captain payout is held pending human review — this summary does not approve or deny anything."
    )
