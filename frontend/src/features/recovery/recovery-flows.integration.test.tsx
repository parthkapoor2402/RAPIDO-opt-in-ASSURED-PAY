import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BookingPageContent } from "@/components/pages/BookingPageContent";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { RecoveryPageContentForTest } from "@/components/pages/RecoveryPageContent";
import { SupportReviewPageContent } from "@/components/pages/SupportReviewPageContent";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { LiveRideProvider } from "@/features/live-ride/context/LiveRideProvider";
import { RecoveryProvider } from "@/features/recovery/context/RecoveryProvider";
import { MOCK_RECOVERY_WITH_DUE, MOCK_REPEAT_UNPAID } from "@/features/recovery/mock/recovery-mock";
import type { ReactNode } from "react";

vi.mock("@/features/recovery/api/recovery", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/recovery/api/recovery")>();
  return {
    ...actual,
    fetchRecoveryStateWithFallback: vi.fn(),
    payResidualDueWithFallback: vi.fn(async () => ({
      id: "due_mock_open",
      ride_id: "ride_overage",
      amount_inr: 3,
      status: "paid",
      message: "Payment received. Your due is cleared.",
    })),
    createDisputeWithFallback: vi.fn(async (input) => ({
      id: "dsp_mock",
      ...input,
      status: "open",
    })),
    fetchReviewQueueWithFallback: vi.fn(async () => [
      {
        id: "rev_ride_suspicious",
        ride_id: "ride_suspicious",
        rider_id: "rider_commuter",
        captain_id: "captain_ravi",
        approved_m: 49,
        actual_a: 80,
        excess_inr: 31,
        reason_codes: [],
        state: "pending",
      },
    ]),
  };
});

import * as recoveryApi from "@/features/recovery/api/recovery";

function withProviders(children: ReactNode, scenarioId = "rider_commuter") {
  return (
    <DemoScenarioProvider initialScenarioId={scenarioId}>
      <RecoveryProvider>
        <AssuredPayBookingProvider>
          <LiveRideProvider>{children}</LiveRideProvider>
        </AssuredPayBookingProvider>
      </RecoveryProvider>
    </DemoScenarioProvider>
  );
}

describe("recovery flow integration", () => {
  it("home shows pending due banner on next open", async () => {
    vi.mocked(recoveryApi.fetchRecoveryStateWithFallback).mockResolvedValueOnce(MOCK_RECOVERY_WITH_DUE);
    render(withProviders(<HomePageContent />));
    await waitFor(() => {
      expect(screen.getByTestId("recovery-banner")).toBeInTheDocument();
    });
    expect(screen.getByTestId("pay-now-banner-cta")).toHaveTextContent("Pay ₹3 now");
  });

  it("successful due recovery via pay now", async () => {
    vi.mocked(recoveryApi.fetchRecoveryStateWithFallback)
      .mockResolvedValueOnce(MOCK_RECOVERY_WITH_DUE)
      .mockResolvedValueOnce({
        ...MOCK_RECOVERY_WITH_DUE,
        has_pending_due: false,
        show_banner: false,
        open_dues: [],
        pending_amount_inr: 0,
        rebooking: { ...MOCK_RECOVERY_WITH_DUE.rebooking, assured_pay_eligible: true, restriction: "none", open_due_count: 0 },
      });
    const user = userEvent.setup();
    render(withProviders(<RecoveryPageContentForTest />));
    await waitFor(() => {
      expect(screen.getByTestId("recovery-page")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("pay-now-recovery-cta"));
    expect(recoveryApi.payResidualDueWithFallback).toHaveBeenCalledWith("due_mock_open", 3);
  });

  it("dispute submission shows success state", async () => {
    vi.mocked(recoveryApi.fetchRecoveryStateWithFallback).mockResolvedValue(MOCK_RECOVERY_WITH_DUE);
    const user = userEvent.setup();
    render(withProviders(<RecoveryPageContentForTest />));
    await waitFor(() => {
      expect(screen.getByTestId("dispute-form")).toBeInTheDocument();
    });
    await user.type(screen.getByTestId("dispute-reason-input"), "Waiting time seems too high");
    await user.click(screen.getByTestId("submit-dispute-cta"));
    await waitFor(() => {
      expect(screen.getByTestId("dispute-success")).toBeInTheDocument();
    });
    expect(recoveryApi.createDisputeWithFallback).toHaveBeenCalled();
  });

  it("restricted rebooking shows assured pay blocked with standard ride note", async () => {
    vi.mocked(recoveryApi.fetchRecoveryStateWithFallback).mockResolvedValue(MOCK_REPEAT_UNPAID);
    render(withProviders(<BookingPageContent />, "rider_blocked"));
    await waitFor(() => {
      expect(screen.getByTestId("assured-pay-blocked")).toBeInTheDocument();
    });
    expect(screen.getByTestId("repeat-unpaid-notice")).toHaveTextContent("Standard bike booking is still available");
    expect(screen.getByRole("button", { name: /book bike/i })).toBeInTheDocument();
  });

  it("support review queue renders pending cases", async () => {
    render(<SupportReviewPageContent />);
    await waitFor(() => {
      expect(screen.getByTestId("support-review-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("support-case-card")).toHaveTextContent("ride_suspicious");
    expect(screen.getByTestId("support-case-card")).toHaveTextContent("₹49");
  });
});
