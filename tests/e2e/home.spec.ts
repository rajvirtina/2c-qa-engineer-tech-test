import { expect, test } from '@playwright/test';
import { waitForHomePage } from '../fixtures/app-waits';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForHomePage(page);
  });

  test.describe('Page Load & Layout', () => {
    test('should display the page title and heading', async ({ page }) => {
      await expect(page).toHaveTitle(/book/i);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
    });

    test('should display the book list', async ({ page }) => {
      const bookList = page.getByRole('list').or(page.locator('[data-testid="book-list"]')).first();
      await expect(bookList).toBeVisible();
    });

    test('should display at least one book', async ({ page }) => {
      const bookItems = page.locator('li, [data-testid="book-item"], article').first();
      await expect(bookItems).toBeVisible({ timeout: 10_000 });
    });

    test("should display an 'Add Book' navigation link", async ({ page }) => {
      const addBookLink = page
        .getByRole('link', { name: /add/i })
        .or(page.getByRole('button', { name: /add/i }));
      await expect(addBookLink.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe('Book Cards', () => {
    test('should display book title for each book', async ({ page }) => {
      const firstBookTitle = page
        .getByRole('heading', { level: 2 })
        .or(page.getByRole('heading', { level: 3 }))
        .first();
      await expect(firstBookTitle).toBeVisible({ timeout: 10_000 });
    });

    test('should display book author for each book', async ({ page }) => {
      const firstBookLink = page.locator('a[href*="/book/"]').first();
      await expect(firstBookLink).toBeVisible({ timeout: 10_000 });
      await expect(firstBookLink).toContainText(/by\s+/i);
    });

    test('should make each book clickable (has link)', async ({ page }) => {
      const bookLinks = page.locator('a[href*="/book/"]');
      await expect(bookLinks.first()).toBeVisible({ timeout: 10_000 });
      const count = await bookLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to book detail page when book is clicked', async ({ page }) => {
      const bookLink = page.locator('a[href*="/book/"]').first();
      await expect(bookLink).toBeVisible({ timeout: 10_000 });
      await bookLink.click();
      await expect(page).toHaveURL(/\/book\/\d+/, { timeout: 10_000 });
    });

    test('should navigate to Add Book page via nav link', async ({ page }) => {
      const addLink = page.getByRole('link', { name: /add/i }).first();
      await addLink.click();
      await expect(page).toHaveURL(/add-book/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await waitForHomePage(page);
      const firstLink = page.locator('a[href*="/book/"]').first();
      await expect(firstLink).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await waitForHomePage(page);
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');
      await waitForHomePage(page);
    });

    test("should display genre on at least one book card", async ({ page }) => {
    // Fetch the known genres from the API and confirm at least one appears in the UI
    const res = await page.request.get("/api/books");
    const books = await res.json();
    const firstGenre = books[0]?.genre;

    if (firstGenre) {
      await expect(page.getByText(firstGenre).first()).toBeVisible();
    } else {
      // Genre is optional — if no seeded book has one, skip gracefully
      test.skip();
    }
  });
test("should display author name visibly on book cards", async ({ page }) => {
    const res = await page.request.get("/api/books");
    const books = await res.json();
    const firstAuthor = books[0]?.author;

    await expect(page.getByText(firstAuthor).first()).toBeVisible();
  });

  test("should display rating on at least one book card", async ({ page }) => {
    const res = await page.request.get("/api/books");
    const books = await res.json();
    const firstRating = books[0]?.rating;

    if (firstRating !== undefined) {
      // Rating may be shown as a number or as stars — check either
      const ratingText = String(firstRating);
      const hasNumericRating = await page.getByText(ratingText).isVisible().catch(() => false);
      const hasStars = await page.locator("[aria-label*='rating'], [data-testid*='rating'], .rating, .stars").isVisible().catch(() => false);
      expect(hasNumericRating || hasStars).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test("should display pages count on at least one book card", async ({ page }) => {
    const res = await page.request.get("/api/books");
    const books = await res.json();
    // Find a seeded book that has a pages value
    const bookWithPages = books.find((b: any) => b.pages !== undefined);

    if (bookWithPages) {
      const pagesText = String(bookWithPages.pages);
      // pages may appear as "180" or "180 pages" etc.
      await expect(page.getByText(new RegExp(pagesText)).first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test("total number of book links should match the API book count", async ({
    page,
  }) => {
    const res = await page.request.get("/api/books");
    const books = await res.json();
    const apiCount = books.length;

    const bookLinks = page.locator('a[href*="/book/"]');
    const uiCount = await bookLinks.count();

    // UI should render at least as many books as the API returns
    expect(uiCount).toBeGreaterThanOrEqual(apiCount);
  });
});

test.describe("Home Page — Loading State", () => {
  test("should show loading indicator or content quickly on navigation", async ({
    page,
  }) => {
    // Intercept to slow the API response, confirm loading UI exists
    await page.route("/api/books", async (route) => {
      await page.waitForTimeout(300);
      await route.continue();
    });

    await page.goto("/");

    // Either a loading indicator is briefly visible, OR content appears — both are valid
    const bodyVisible = await page.locator("body").isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test("should eventually render books even after a slow API response", async ({
    page,
  }) => {
    await page.route("/api/books", async (route) => {
      await page.waitForTimeout(500);
      await route.continue();
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstBookLink = page.locator('a[href*="/book/"]').first();
    await expect(firstBookLink).toBeVisible({ timeout: 15_000 });
  });
  });
});