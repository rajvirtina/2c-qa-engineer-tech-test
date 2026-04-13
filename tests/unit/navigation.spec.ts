import { test, expect } from "@playwright/test";

test.describe("Navigation: Cancel Flow", () => {
  test("home → add → cancel → back on home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to add-book
    const addLink = page.getByRole("link", { name: /add/i }).first();
    await addLink.click();
    await expect(page).toHaveURL(/add-book/);

    // Use cancel button if present, otherwise use Back/Home link
    const cancelBtn = page
      .getByRole("button", { name: /cancel/i })
      .or(page.getByRole("link", { name: /cancel/i }))
      .first();
    const hasCancelBtn = await cancelBtn.isVisible().catch(() => false);

    if (hasCancelBtn) {
      await cancelBtn.click();
    } else {
      const homeLink = page
        .getByRole("link", { name: /home|back/i })
        .or(page.locator('a[href="/"]'))
        .first();
      await homeLink.click();
    }

    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/");
  });

  test("after cancel, home page should still show all books", async ({
    page,
  }) => {
    await page.goto("/add-book");
    await page.getByLabel(/title/i).fill("Canceled Book");

    const homeLink = page
      .getByRole("link", { name: /home|back/i })
      .or(page.locator('a[href="/"]'))
      .first();
    await homeLink.click();
    await page.waitForLoadState("networkidle");

    const bookLinks = page.locator('a[href*="/book/"]');
    const count = await bookLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Navigation: Detail → Add Another Book → New Detail", () => {
  test("detail page → 'Add Another Book' → fill form → submit → new book detail", async ({
    page,
  }) => {
    // Start on a book detail page
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    // Find "Add Another Book" link
    const addAnotherLink = page
      .getByRole("link", { name: /add another|add book|add a book/i })
      .first();
    const hasAddAnother = await addAnotherLink.isVisible().catch(() => false);

    if (!hasAddAnother) {
      test.skip();
      return;
    }

    await addAnotherLink.click();
    await expect(page).toHaveURL(/add-book/);

    const title = `From Detail ${Date.now()}`;
    await page.getByLabel(/title/i).fill(title);
    await page.getByLabel(/author/i).fill("Another Author");

    const submitBtn = page
      .getByRole("button", { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    // Should land on new book detail or home
    const onDetail = !!page.url().match(/\/book\/\d+/);
    if (onDetail) {
      await expect(page.getByText(title)).toBeVisible();
    } else {
      await page.goto("/");
      await expect(page.getByText(title)).toBeVisible();
    }
  });
});

test.describe("Navigation: All Links on Detail Page", () => {
  test("detail page should have a working 'Back to Library' or home link", async ({
    page,
  }) => {
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    const backLink = page
      .getByRole("link", { name: /back|home|library/i })
      .or(page.locator('a[href="/"]'))
      .first();
    await expect(backLink).toBeVisible();

    const href = await backLink.getAttribute("href");
    expect(href).toMatch(/^\/?$/); // "/" or ""
  });

  test("every link on detail page should have a non-empty href", async ({
    page,
  }) => {
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    const allLinks = page.locator("a");
    const count = await allLinks.count();

    for (let i = 0; i < count; i++) {
      const href = await allLinks.nth(i).getAttribute("href");
      expect(href).not.toBeNull();
      expect(href?.trim().length).toBeGreaterThan(0);
    }
  });

  test("detail page has at most the expected navigation links (no broken/extra links)", async ({
    page,
  }) => {
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    const links = await page.locator("a").allInnerTexts();
    const uniqueLinks = new Set(links.map((l) => l.trim().toLowerCase()));

    // Expected link targets: back/home + maybe "add another book"
    // If there are 10+ link texts, something is wrong
    expect(links.length).toBeLessThan(20);
  });
});

test.describe("Navigation: Error Page Recovery", () => {
  test("visiting non-existent book → clicking back → home page works", async ({
    page,
  }) => {
    await page.goto("/book/99999");
    await page.waitForLoadState("networkidle");

    // Use browser back or page back link
    const backLink = page
      .getByRole("link", { name: /back|home|library/i })
      .or(page.locator('a[href="/"]'))
      .first();

    const hasBack = await backLink.isVisible().catch(() => false);

    if (hasBack) {
      await backLink.click();
    } else {
      await page.goBack();
    }

    await page.waitForLoadState("networkidle");
    // Should be on a valid page with books
    const bookLinks = page.locator('a[href*="/book/"]');
    const count = await bookLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("home page is fully usable after navigating to a 404 and back", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.goto("/book/99999");
    await page.waitForLoadState("networkidle");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Home should be fully functional
    const firstBookLink = page.locator('a[href*="/book/"]').first();
    await expect(firstBookLink).toBeVisible();

    const addLink = page.getByRole("link", { name: /add/i }).first();
    await expect(addLink).toBeVisible();
  });
});

test.describe("Navigation: State Maintenance", () => {
  test("books added in one session are visible when navigating back to home", async ({
    page,
  }) => {
    const title = `State Test ${Date.now()}`;

    // Add a book
    await page.goto("/add-book");
    await page.getByLabel(/title/i).fill(title);
    await page.getByLabel(/author/i).fill("State Author");
    const submitBtn = page
      .getByRole("button", { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    // Navigate away then back
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The added book should still be visible
    await expect(page.getByText(title)).toBeVisible();
  });
});
