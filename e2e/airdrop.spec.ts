import { test, expect } from "@playwright/test"

test.describe("Airdrop Hub", () => {
  test("lists airdrops", async ({ page }) => {
    await page.goto("/airdrop")
    await expect(page).toHaveURL("/airdrop")
    // Page should render without error
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("navigates to airdrop detail", async ({ page }) => {
    await page.goto("/airdrop")
    const firstAirdrop = page.locator("a[href^='/airdrop/']").first()
    const href = await firstAirdrop.getAttribute("href")
    if (href) {
      await page.goto(href)
      await expect(page.locator("h1")).toBeVisible()
    }
  })
})
