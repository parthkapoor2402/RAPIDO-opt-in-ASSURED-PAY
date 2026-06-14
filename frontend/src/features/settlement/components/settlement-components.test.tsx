import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CAPTAIN_PAYOUT_LABELS } from "@/features/settlement/lib/completion-copy";
import { SettlementLedger } from "@/features/settlement/components/SettlementLedger";
import { SettlementSummary } from "@/features/settlement/components/SettlementSummary";
import { buildMockSettlement } from "@/features/settlement/mock/settlement-mock";

describe("SettlementSummary", () => {
  it("shows nothing due for within max", () => {
    const settlement = buildMockSettlement("within_max");
    render(<SettlementSummary settlement={settlement} />);
    const summary = screen.getByTestId("settlement-summary");
    expect(summary).toHaveTextContent("Charged now");
    expect(summary).toHaveTextContent("Still due");
    expect(summary).toHaveTextContent("Nothing");
    expect(summary).toHaveTextContent(CAPTAIN_PAYOUT_LABELS.paidInFull);
  });

  it("shows captain paid in full for buffer within max", () => {
    const settlement = buildMockSettlement("buffer_within_max");
    render(<SettlementSummary settlement={settlement} dueChipLabel={null} />);
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("₹48");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent(
      CAPTAIN_PAYOUT_LABELS.paidInFull,
    );
  });

  it("shows still due for valid overage (C1)", () => {
    const settlement = buildMockSettlement("valid_overage");
    render(<SettlementSummary settlement={settlement} dueChipLabel="₹3 due" />);
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("Still due");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("₹3");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent(
      CAPTAIN_PAYOUT_LABELS.paidByAssurance,
    );
  });

  it("shows above max not billed for suspicious overage (C2)", () => {
    const settlement = buildMockSettlement("suspicious_overage");
    render(<SettlementSummary settlement={settlement} dueChipLabel="Under review" />);
    expect(screen.getByText("Under review")).toBeInTheDocument();
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("Above max");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("Not billed yet");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent(
      CAPTAIN_PAYOUT_LABELS.pendingReview,
    );
  });
});

describe("SettlementLedger", () => {
  it("renders settlement timeline events for valid overage", () => {
    const settlement = buildMockSettlement("valid_overage");
    render(<SettlementLedger events={settlement.ledger} />);
    expect(screen.getByTestId("settlement-ledger")).toHaveTextContent("Captain credited full fare");
    expect(screen.getByTestId("settlement-ledger")).toHaveTextContent("Residual due created");
  });
});
