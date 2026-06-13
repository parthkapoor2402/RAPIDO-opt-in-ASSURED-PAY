import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettlementLedger } from "@/features/settlement/components/SettlementLedger";
import { SettlementSummary } from "@/features/settlement/components/SettlementSummary";
import { buildMockSettlement } from "@/features/settlement/mock/settlement-mock";

describe("SettlementSummary", () => {
  it("shows approved max and captain payout for happy path", () => {
    const settlement = buildMockSettlement("happy_path");
    render(<SettlementSummary settlement={settlement} />);
    const summary = screen.getByTestId("settlement-summary");
    expect(summary).toHaveTextContent("Approved max (M)");
    expect(summary).toHaveTextContent("₹49");
    expect(summary).toHaveTextContent("Captain payout");
    expect(summary).toHaveTextContent("₹46");
    expect(summary).toHaveTextContent("None");
  });

  it("shows residual due for valid overage", () => {
    const settlement = buildMockSettlement("valid_overage");
    render(<SettlementSummary settlement={settlement} />);
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("Residual due created");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("₹3");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("₹52");
  });

  it("shows review state for suspicious overage", () => {
    const settlement = buildMockSettlement("suspicious_overage");
    render(<SettlementSummary settlement={settlement} />);
    expect(screen.getByText("Under review")).toBeInTheDocument();
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("Held pending review");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("₹80");
  });
});

describe("SettlementLedger", () => {
  it("renders settlement timeline events", () => {
    const settlement = buildMockSettlement("valid_overage");
    render(<SettlementLedger events={settlement.ledger} />);
    expect(screen.getByTestId("settlement-ledger")).toHaveTextContent("Settlement timeline");
    expect(screen.getByTestId("settlement-ledger")).toHaveTextContent("Captain credited");
    expect(screen.getByTestId("settlement-ledger")).toHaveTextContent("Residual due created");
  });
});
