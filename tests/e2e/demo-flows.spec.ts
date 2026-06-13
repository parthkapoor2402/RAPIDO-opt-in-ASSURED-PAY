import { expect, test } from "@playwright/test";

import { enableAssuredPay, switchDemoScenario } from "./helpers/demo";

test.describe("App shell smoke", () => {
  test("home and bottom nav load", async ({ page }) => {
    await page.goto("/home");
    await expect(page.getByTestId("app-shell")).toBeVisible();
    await expect(page.getByTestId("app-bottom-nav")).toBeVisible();
    await expect(page.getByTestId("app-bottom-nav").getByRole("link", { name: "Book" })).toBeVisible();
  });

  test("demo scenarios page loads", async ({ page }) => {
    await page.goto("/demo/scenarios");
    await expect(page.getByTestId("scenario-switcher")).toBeVisible();
    await expect(page.getByRole("heading", { name: /demo scenarios/i })).toBeVisible();
  });
});

test.describe("Assured Pay demo flows", () => {
  test("discovery from booking", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.getByTestId("assured-pay-booking-card")).toBeVisible();
    await expect(page.getByTestId("assured-pay-opt-in-cta")).toBeVisible();
    await expect(page.getByTestId("assured-pay-fare-card")).toBeVisible();
  });

  test("opt-in flow", async ({ page }) => {
    await enableAssuredPay(page);
    await expect(page.getByTestId("assured-pay-enabled-banner")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Book Bike · Assured Pay on/i })).toBeVisible();
  });

  test("ride within approved max", async ({ page }) => {
    await page.goto("/ride/live");
    await expect(page.getByTestId("fare-trust-indicator")).toBeVisible();
    await expect(page.getByTestId("fare-trust-indicator").getByText("Within approved max")).toBeVisible();
    await expect(page.getByTestId("fare-progression-card")).toBeVisible();
    await expect(page.getByTestId("approved-max-indicator")).toBeVisible();
  });

  test("small valid overage at completion", async ({ page }) => {
    await page.goto("/ride/completed?outcome=valid_overage");
    await expect(page.getByTestId("ride-completed-page")).toBeVisible();
    await expect(page.getByTestId("settlement-summary")).toContainText("Residual due open");
    await expect(page.getByRole("button", { name: /pay remaining/i })).toBeVisible();
  });

  test("suspicious overage review flow", async ({ page }) => {
    await page.goto("/ride/completed?outcome=suspicious_overage");
    await expect(page.getByRole("heading", { name: /under review/i })).toBeVisible();
    await expect(page.getByTestId("settlement-summary")).toContainText("Under review");
  });

  test("pending due recovery", async ({ page }) => {
    await switchDemoScenario(page, "Open residual due");
    await page.goto("/home");
    await expect(page.getByTestId("recovery-banner")).toBeVisible({ timeout: 15_000 });
    await page.goto("/booking");
    await expect(page.getByTestId("assured-pay-blocked")).toBeVisible();
    await page.goto("/recovery");
    await expect(page.getByTestId("recovery-page")).toBeVisible();
    await expect(page.getByTestId("pay-now-recovery-cta")).toBeVisible();
  });

  test("Grok explanation fallback when assist is disabled", async ({ page }) => {
    await page.goto("/ride/live");
    await expect(page.getByTestId("grok-explanation-panel")).toBeVisible();
    await page.getByTestId("grok-explain-button").click();
    await expect(page.getByTestId("grok-explanation-text")).toBeVisible();
    await expect(page.getByTestId("grok-source-badge")).toContainText("Policy summary");
    await expect(page.getByText(/assistive only/i)).toBeVisible();
  });
});
