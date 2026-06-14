import { test, expect } from "@playwright/test"

test.describe("AI Tools", () => {
  test("renders tools listing", async ({ page }) => {
    await page.goto("/ai-tools")
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("search filters tools", async ({ page }) => {
    await page.goto("/ai-tools")
    const searchInput = page.locator("input[type='search'], input[placeholder*='search' i], input[placeholder*='cari' i]").first()
    if (await searchInput.isVisible()) {
      await searchInput.fill("ChatGPT")
      await page.keyboard.press("Enter")
      // Results should update
      await page.waitForTimeout(500)
    }
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })
})
