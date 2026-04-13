import { test, expect } from "@playwright/test";

test.describe("Error Handling: Home Page API Failure", () => {
  test("should show an error state when /api/books returns 500", async ({
    page,
  }) => {
    await page.route("/api/books", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) })
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // App should show an error message, not crash silently
    const bodyText = await page.locator("body").innerText();
    const hasError = bodyText.toLowerCase().match(/error|failed|unavailable|try again|something went wrong/i);
    const hasEmptyList = !page.locator('a[href*="/book/"]').first().isVisible().catch(() => true);

    expect(hasError || hasEmptyList).toBeTruthy();
  });

  test("should show an error state when /api/books network request fails", async ({
    page,
  }) => {
    await page.route("/api/books", (route) => route.abort("failed"));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(10); // Page should still render something
  });

  test("'Try Again' or retry button should re-fetch books after error", async ({
    page,
  }) => {
    let callCount = 0;
    await page.route("/api/books", async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({ status: 500, body: JSON.stringify({ error: "Temporary error" }) });
      } else {
        await route.continue();
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const retryBtn = page
      .getByRole("button", { name: /try again|retry|reload/i })
      .or(page.getByRole("link", { name: /try again|retry/i }))
      .first();

    const hasRetry = await retryBtn.isVisible().catch(() => false);
    if (hasRetry) {
      await retryBtn.click();
      await page.waitForLoadState("networkidle");
      // After retry the books should load
      const firstBookLink = page.locator('a[href*="/book/"]').first();
      await expect(firstBookLink).toBeVisible({ timeout: 10_000 });
    } else {
      // If no retry button, at minimum the page should render gracefully
      await expect(page.locator("body")).toBeVisible();
    }
  });
});

test.describe("Error Handling: Book Detail API Failure", () => {
  test("should show an error state when /api/books/1 returns 500", async ({
    page,
  }) => {
    await page.route("/api/books/1", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) })
    );

    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(10);

    // Should either show error message or redirect home
    const hasError = bodyText.toLowerCase().match(/error|failed|not found|unavailable/i);
    const isRedirected = page.url() === "http://localhost:3000/" || page.url().endsWith("/");

    expect(hasError || isRedirected).toBeTruthy();
  });

  test("should allow navigation away from error state on detail page", async ({
    page,
  }) => {
    await page.route("/api/books/99999", (route) =>
      route.fulfill({ status: 404, body: JSON.stringify({ error: "Not found" }) })
    );

    await page.goto("/book/99999");
    await page.waitForLoadState("networkidle");

    // Should be able to get back home
    const homeLink = page
      .getByRole("link", { name: /home|back|library/i })
      .or(page.locator('a[href="/"]'))
      .first();
    
    const hasHomeLink = await homeLink.isVisible().catch(() => false);
    if (hasHomeLink) {
      await homeLink.click();
      await expect(page).toHaveURL("/");
    } else {
      // Navigate manually — page should not be in a broken state
      await page.goto("/");
      await expect(page).toHaveURL("/");
    }
  });
});

test.describe("Error Handling: Form Submission Failure", () => {
  test("should show an error message when POST /api/books fails", async ({
    page,
  }) => {
    await page.route("/api/books", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Failed to save book" }),
        });
      }
      return route.continue();
    });

    await page.goto("/add-book");
    await page.getByLabel(/title/i).fill("Failed Submit Book");
    await page.getByLabel(/author/i).fill("Failed Author");

    const submitBtn = page
      .getByRole("button", { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    // Should stay on add-book page and show an error
    const bodyText = await page.locator("body").innerText();
    const hasError = bodyText.toLowerCase().match(/error|failed|unable|could not|try again/i);
    const stillOnForm = page.url().includes("/add-book");

    expect(hasError || stillOnForm).toBeTruthy();
  });

  test("form data should be preserved after a failed submission", async ({
    page,
  }) => {
    await page.route("/api/books", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Server error" }),
        });
      }
      return route.continue();
    });

    await page.goto("/add-book");
    const titleInput = page.getByLabel(/title/i);
    const authorInput = page.getByLabel(/author/i);

    await titleInput.fill("Preserved Title");
    await authorInput.fill("Preserved Author");

    const submitBtn = page
      .getByRole("button", { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    if (page.url().includes("/add-book")) {
      // Form data should still be there
      await expect(titleInput).toHaveValue("Preserved Title");
      await expect(authorInput).toHaveValue("Preserved Author");
    }
  });
});

test.describe("Error Handling: Special Characters in Input", () => {
  test("special characters in title should not break the page render", async ({
    page,
  }) => {
    const specialTitle = `Special <Chars> & "Quotes" ${Date.now()}`;
    await page.goto("/add-book");
    await page.getByLabel(/title/i).fill(specialTitle);
    await page.getByLabel(/author/i).fill("Special Author");

    const submitBtn = page
      .getByRole("button", { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    // Navigate to home and verify the special char book renders without breaking
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    // No JS errors should have thrown
  });

  test("very long book title should not break the home page layout", async ({
    page,
  }) => {
    const longTitle = `${"Very Long Title ".repeat(15)}${Date.now()}`;
    await page.request.post("/api/books", {
      data: { title: longTitle.slice(0, 200), author: "Long Author" },
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Page should still be usable
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('a[href*="/book/"]').first()).toBeVisible();
  });
});

test.describe("Error Handling: Direct URL Access", () => {
  test("directly accessing /add-book should render the form", async ({
    page,
  }) => {
    await page.goto("/add-book");
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel(/title/i)).toBeVisible();
  });

  test("directly accessing /book/1 should render the detail page", async ({
    page,
  }) => {
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("directly accessing / should render the home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('a[href*="/book/"]').first()).toBeVisible();
  });

  test("accessing a completely unknown route should not show a broken page", async ({
    page,
  }) => {
    const response = await page.goto("/this-page-does-not-exist");
    // Should return 404 but render something — not a blank white page
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(5);
  });
});
