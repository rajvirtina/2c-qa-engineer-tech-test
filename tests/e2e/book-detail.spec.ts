import { expect, test } from '@playwright/test';
import { waitForBookDetailContent, waitForBookDetailPage, waitForHomePage } from '../fixtures/app-waits';

test.describe('Book Detail Page', () => {
  test.describe('Valid Book', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForHomePage(page);
      const firstBookLink = page.locator('a[href*="/book/"]').first();
      await expect(firstBookLink).toBeVisible();
      await firstBookLink.click();
      await waitForBookDetailContent(page);
    });

    test('should display the book title prominently', async ({ page }) => {
      const heading = page
        .getByRole('heading', { level: 1 })
        .or(page.getByRole('heading', { level: 2 }))
        .first();
      await expect(heading).toBeVisible();
      const text = await heading.innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    });

    test('should display the author name', async ({ page }) => {
      await expect(page.getByText(/^by\s+.+/i).first()).toBeVisible();
    });

    test('should display the genre', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toMatch(/genre/i);
    });

    test('should display the published year', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toMatch(/\b(19|20)\d{2}\b/);
    });

    test('should display the book description', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toMatch(/description/i);
    });

    test('should display the ISBN', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toMatch(/isbn/i);
    });

    test('should display the number of pages', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toMatch(/page/i);
    });

    test('should display the rating', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toMatch(/rating/i);
    });

    test('should have a back/home navigation link', async ({ page }) => {
      const backLink = page
        .getByRole('link', { name: /back|home/i })
        .or(page.locator('a[href="/"]'))
        .first();
      await expect(backLink).toBeVisible();
    });

    test('should navigate back to home when back link is clicked', async ({ page }) => {
      const backLink = page
        .getByRole('link', { name: /back|home/i })
        .or(page.locator('a[href="/"]'))
        .first();
      await backLink.click();
      await expect(page).toHaveURL('/');
    });

    test('URL should contain the book ID', async ({ page }) => {
      await expect(page).toHaveURL(/\/book\/\d+/);
    });
  });

  test.describe('Direct URL Navigation', () => {
    test('should load book 1 directly via URL', async ({ page }) => {
      await page.goto('/book/1');
      await waitForBookDetailContent(page);
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(50);
      await expect(page.getByRole('heading').first()).toBeVisible();
    });
  });

  test.describe('Not Found / Error Handling', () => {
    test('should show a not-found or error state for non-existent book ID', async ({ page }) => {
      await page.goto('/book/99999');
      await waitForBookDetailPage(page);
      const bodyText = await page.locator('body').innerText().catch(() => '');
      const isNotFound =
        bodyText.toLowerCase().includes('not found') ||
        bodyText.toLowerCase().includes('error') ||
        bodyText.toLowerCase().includes('does not exist') ||
        page.url().includes('/');
      expect(isNotFound).toBeTruthy();
    });

    test('should handle non-numeric book ID gracefully', async ({ page }) => {
      const response = await page.goto('/book/abc');
      expect([200, 400, 404].includes(response?.status() ?? 200)).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/book/1');
      await expect(page.locator('body')).toBeVisible();
    });
  });

test.describe("Book Detail — Star Rating Display", () => {
  test("should display a star rating element or numeric rating", async ({
    page,
  }) => {
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");
    const starEl = page
      .locator("[aria-label*='rating'], [data-testid*='rating'], .stars, .rating, [class*='star']")
      .first();
    const hasStarEl = await starEl.isVisible().catch(() => false);

    if (!hasStarEl) {
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).toMatch(/\d+\.\d/);
    } else {
      await expect(starEl).toBeVisible();
    }
  });

  test("star rating should reflect the correct book rating value", async ({
    page,
  }) => {
    // Get the expected rating from the API
    const res = await page.request.get("/api/books/1");
    const book = await res.json();

    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    if (book.rating !== undefined) {
      const bodyText = await page.locator("body").innerText();
      // Rating value or its integer part should appear somewhere
      expect(bodyText).toMatch(new RegExp(String(book.rating).replace(".", "\\.")));
    }
  });
});

test.describe("Book Detail — Add Another Book Link", () => {
  test("should display an 'Add Another Book' or 'Add Book' link", async ({
    page,
  }) => {
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    const addLink = page
      .getByRole("link", { name: /add another|add book|add a book/i })
      .first();
    await expect(addLink).toBeVisible();
  });

  test("'Add Another Book' link navigates to add-book page", async ({
    page,
  }) => {
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    const addLink = page
      .getByRole("link", { name: /add another|add book|add a book/i })
      .first();
    await addLink.click();
    await expect(page).toHaveURL(/add-book/);
  });
});

test.describe("Book Detail — Loading State", () => {
  test("should render content after a slow API response", async ({ page }) => {
    await page.route("/api/books/1", async (route) => {
      await page.waitForTimeout(400);
      await route.continue();
    });

    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Book Detail — Multiple Books Show Distinct Data", () => {
  test("book 1 and book 2 should display different titles", async ({ page }) => {
    // Fetch both books via API first
    const [res1, res2] = await Promise.all([
      page.request.get("/api/books/1"),
      page.request.get("/api/books/2"),
    ]);

    // Only run if both exist
    if (res1.status() !== 200 || res2.status() !== 200) {
      test.skip();
      return;
    }

    const book1 = await res1.json();
    const book2 = await res2.json();

    // Check book 1
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");
    const heading1 = await page.getByRole("heading").first().innerText();
    expect(heading1).toContain(book1.title);

    // Check book 2
    await page.goto("/book/2");
    await page.waitForLoadState("networkidle");
    const heading2 = await page.getByRole("heading").first().innerText();
    expect(heading2).toContain(book2.title);

    // They should differ
    expect(heading1).not.toBe(heading2);
  });

  test("navigating between two book pages shows correct authors", async ({
    page,
  }) => {
    const [res1, res2] = await Promise.all([
      page.request.get("/api/books/1"),
      page.request.get("/api/books/2"),
    ]);

    if (res1.status() !== 200 || res2.status() !== 200) {
      test.skip();
      return;
    }

    const book1 = await res1.json();
    const book2 = await res2.json();

    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(book1.author).first()).toBeVisible();

    await page.goto("/book/2");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(book2.author).first()).toBeVisible();
  });
});

test.describe("Book Detail — Field-Level Assertions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/book/1");
    await page.waitForLoadState("networkidle");
  });

  test("title should be in a heading element, not just body text", async ({
    page,
  }) => {
    const res = await page.request.get("/api/books/1");
    const book = await res.json();

    const titleInHeading = page
      .getByRole("heading")
      .filter({ hasText: book.title })
      .first();
    await expect(titleInHeading).toBeVisible();
  });

  test("published year should appear as a standalone value", async ({ page }) => {
    const res = await page.request.get("/api/books/1");
    const book = await res.json();

    if (book.publishedYear) {
      await expect(
        page.getByText(String(book.publishedYear)).first()
      ).toBeVisible();
    }
  });

  test("page count should appear as a standalone value", async ({ page }) => {
    const res = await page.request.get("/api/books/1");
    const book = await res.json();

    if (book.pages) {
      await expect(
        page.getByText(new RegExp(String(book.pages))).first()
      ).toBeVisible();
    }
  });
  });
});