import { expect, type Page } from "@playwright/test";

/** Select a demo destination on the booking page. */
export async function selectBookingDestination(page: Page): Promise<void> {
  await page.getByTestId("destination-suggestion-indiranagar").click();
  await expect(page.getByTestId("ride-category-list")).toBeVisible({ timeout: 10_000 });
}

/** Switch demo persona from Profile → Demo scenarios. */
export async function switchDemoScenario(page: Page, label: string): Promise<void> {
  await page.goto("/demo/scenarios");
  await page.getByRole("button", { name: new RegExp(label, "i") }).click();
  await expect(page.getByTestId("scenario-switcher-active")).toContainText(new RegExp(label, "i"));
}

/** Complete Assured Pay opt-in on the dedicated sheet. */
export async function enableAssuredPay(page: Page): Promise<void> {
  await page.goto("/booking/assured-pay");
  await page.getByRole("button", { name: /Use Assured Pay/i }).click();
  const confirm = page.getByTestId("confirm-assured-pay-cta");
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await page.waitForURL("**/booking");
  await selectBookingDestination(page);
  await expect(page.getByTestId("assured-pay-booking-card")).toBeVisible();
}
