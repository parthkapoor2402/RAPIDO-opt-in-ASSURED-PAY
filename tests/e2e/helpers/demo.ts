import { expect, type Page } from "@playwright/test";

/** Switch demo persona from Profile → Demo scenarios. */
export async function switchDemoScenario(page: Page, label: string): Promise<void> {
  await page.goto("/demo/scenarios");
  await page.getByRole("button", { name: new RegExp(label, "i") }).click();
  await expect(page.getByTestId("scenario-switcher-active")).toContainText(new RegExp(label, "i"));
}

/** Complete Assured Pay opt-in on the dedicated sheet. */
export async function enableAssuredPay(page: Page): Promise<void> {
  await page.goto("/booking/assured-pay");
  await page
    .locator("li")
    .filter({ hasText: "Enable Assured Pay" })
    .getByRole("button")
    .click();
  const confirm = page.getByTestId("confirm-assured-pay-cta");
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await page.waitForURL("**/booking");
  await expect(page.getByTestId("assured-pay-booking-card")).toBeVisible();
}
