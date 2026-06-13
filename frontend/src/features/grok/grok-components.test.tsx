import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GrokExplanationPanel } from "@/features/grok/components/GrokExplanationPanel";

vi.mock("@/features/grok/api/assist", () => ({
  fetchExplanationWithFallback: vi.fn(async () => ({
    text: "Your approved max is ₹49. The current fare is ₹46 — still within what you approved.",
    source: "fallback",
    use_case: "fare_change",
    grok_available: false,
  })),
}));

import { fetchExplanationWithFallback } from "@/features/grok/api/assist";

describe("GrokExplanationPanel", () => {
  it("renders explain button and shows explanation on click", async () => {
    const user = userEvent.setup();
    render(
      <GrokExplanationPanel
        buttonLabel="Explain my fare"
        useCase="fare_change"
        payload={{
          estimate_f: 42,
          approved_m: 49,
          buffer: 7,
          current_fare: 46,
          reason_label: "Waiting after arrival",
        }}
      />,
    );
    expect(screen.getByTestId("grok-explain-button")).toHaveTextContent("Explain my fare");
    await user.click(screen.getByTestId("grok-explain-button"));
    await waitFor(() => {
      expect(screen.getByTestId("grok-explanation-text")).toBeInTheDocument();
    });
    expect(screen.getByTestId("grok-explanation-text")).toHaveTextContent("₹49");
    expect(screen.getByTestId("grok-source-badge")).toHaveTextContent("Policy summary");
  });

  it("shows loading state while fetching", async () => {
    vi.mocked(fetchExplanationWithFallback).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                text: "Loading test",
                source: "fallback",
                use_case: "pending_due",
                grok_available: false,
              }),
            50,
          );
        }),
    );
    const user = userEvent.setup();
    render(
      <GrokExplanationPanel
        buttonLabel="Why do I owe this amount?"
        useCase="pending_due"
        payload={{
          amount_inr: 3,
          approved_m: 49,
          actual_a: 52,
          reason_label: "Waiting after arrival",
        }}
      />,
    );
    await user.click(screen.getByTestId("grok-explain-button"));
    expect(screen.getByTestId("grok-explain-loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("grok-explanation-text")).toHaveTextContent("Loading test");
    });
  });
});
