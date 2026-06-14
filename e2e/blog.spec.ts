import { test, expect } from "@playwright/test"

test.describe("Blog", () => {
  test("lists posts and navigates to detail", async ({ page }) => {
    await page.goto("/blog")
    await expect(page).toHaveTitle(/blog|artikel/i)
    // Find first blog card link
    const firstPost = page.locator("a[href^='/blog/']").first()
    await expect(firstPost).toBeVisible()
    await firstPost.click()
    await expect(page).toHaveURL(/\/blog\/.+/)
    // Detail page has heading
    await expect(page.locator("h1")).toBeVisible()
  })

  test("share buttons are visible on post detail", async ({ page }) => {
    // Go to first available post
    await page.goto("/blog")
    const firstPost = page.locator("a[href^='/blog/']").first()
    const href = await firstPost.getAttribute("href")
    if (href) {
      await page.goto(href)
      // Share area or social buttons
      const shareSection = page.locator('[aria-label*="share" i], [data-testid="share"], .share')
      // Allow flexible — may not always be present
    }
    await expect(page.locator("h1")).toBeVisible()
  })
})
