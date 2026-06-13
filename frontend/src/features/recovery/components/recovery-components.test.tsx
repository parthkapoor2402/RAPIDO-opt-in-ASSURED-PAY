import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecoveryBanner } from "@/features/recovery/components/RecoveryBanner";
import { FareBreakdownReview } from "@/features/recovery/components/FareBreakdownReview";
import { MOCK_RECOVERY_WITH_DUE, MOCK_REPEAT_UNPAID } from "@/features/recovery/mock/recovery-mock";

describe("RecoveryBanner", () => {
  it("shows pending amount and pay CTA", () => {
    render(<RecoveryBanner recovery={MOCK_RECOVERY_WITH_DUE} />);
    expect(screen.getByTestId("recovery-banner")).toHaveTextContent("remaining balance");
    expect(screen.getByTestId("pay-now-banner-cta")).toHaveTextContent("Pay ₹3 now");
    expect(screen.getByTestId("resolve-now-cta")).toHaveTextContent("Review fare breakdown");
  });

  it("shows grace reminder when within grace period", () => {
    render(<RecoveryBanner recovery={MOCK_RECOVERY_WITH_DUE} />);
    expect(screen.getByTestId("grace-reminder")).toHaveTextContent("5 days left");
  });

  it("shows repeat unpaid restriction message", () => {
    render(<RecoveryBanner recovery={MOCK_REPEAT_UNPAID} />);
    expect(screen.getByTestId("restriction-message")).toHaveTextContent("Standard bike booking still works");
  });

  it("renders nothing when no banner needed", () => {
    const { container } = render(
      <RecoveryBanner recovery={{ ...MOCK_RECOVERY_WITH_DUE, show_banner: false, open_dues: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("FareBreakdownReview", () => {
  it("shows approved max and remaining due", () => {
    render(<FareBreakdownReview due={MOCK_RECOVERY_WITH_DUE.open_dues[0]} />);
    expect(screen.getByTestId("fare-breakdown-review")).toHaveTextContent("Approved max (M)");
    expect(screen.getByTestId("fare-breakdown-review")).toHaveTextContent("₹49");
    expect(screen.getByTestId("fare-breakdown-review")).toHaveTextContent("₹3");
  });
});
