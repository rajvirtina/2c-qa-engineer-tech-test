import { expect, test } from '@playwright/test';
import {
  waitForAddBookPage,
  waitForBookDetailContent,
  waitForBookDetailPage,
  waitForBookSubmission,
  waitForHomePage,
} from '../fixtures/app-waits';

test.describe('User Journey: Browse to Book Detail', () => {
  test("user can view a book's full details from the home page", async ({ page }) => {
    await page.goto('/');
    await waitForHomePage(page);

    const firstBookLink = page.locator('a[href*="/book/"]').first();
    await expect(firstBookLink).toBeVisible();
    await firstBookLink.click();

    await waitForBookDetailContent(page);
    await expect(page).toHaveURL(/\/book\/\d+/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});

test.describe('User Journey: Add Book and Verify', () => {
  test('user can add a book and find it on the home page', async ({ page }) => {
    const uniqueTitle = `Journey Book ${Date.now()}`;

    await page.goto('/add-book');
    await waitForAddBookPage(page);
    await page.getByLabel(/title/i).fill(uniqueTitle);
    await page.getByLabel(/author/i).fill('Journey Author');

    const submitBtn = page
      .getByRole('button', { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    await submitBtn.click();
    await waitForBookSubmission(page);

    await page.goto('/');
    await waitForHomePage(page);
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });

  test('user can add a book and view its detail page', async ({ page }) => {
    const uniqueTitle = `Detail Journey ${Date.now()}`;

    await page.goto('/add-book');
    await waitForAddBookPage(page);
    await page.getByLabel(/title/i).fill(uniqueTitle);
    await page.getByLabel(/author/i).fill('Detail Author');

    const submitBtn = page
      .getByRole('button', { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    await submitBtn.click();
    await waitForBookSubmission(page);

    await page.goto('/');
    await waitForHomePage(page);

    const newBookLink = page.getByText(uniqueTitle).first();
    await expect(newBookLink).toBeVisible();

    const bookAnchor = page.locator('a[href*="/book/"]').filter({ hasText: uniqueTitle }).first();
    if ((await bookAnchor.count()) === 0) {
      await newBookLink.click();
    } else {
      await bookAnchor.click();
    }

    await waitForBookDetailContent(page);
    await expect(page).toHaveURL(/\/book\/\d+/);
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });
});

test.describe('User Journey: Navigation Flow', () => {
  test('user can navigate Home -> Add Book -> Home using links', async ({ page }) => {
    await page.goto('/');
    await waitForHomePage(page);

    const addLink = page.getByRole('link', { name: /add/i }).first();
    await addLink.click();
    await expect(page).toHaveURL(/add-book/);

    const homeLink = page
      .getByRole('link', { name: /home|back/i })
      .or(page.locator('a[href="/"]'))
      .first();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('user can navigate Home -> Book Detail -> Home using back link', async ({ page }) => {
    await page.goto('/');
    await waitForHomePage(page);

    await page.locator('a[href*="/book/"]').first().click();
    await expect(page).toHaveURL(/\/book\/\d+/);

    const backLink = page
      .getByRole('link', { name: /back|home/i })
      .or(page.locator('a[href="/"]'))
      .first();
    await backLink.click();
    await expect(page).toHaveURL('/');
  });

  test('browser back button returns user from detail page to home', async ({ page }) => {
    await page.goto('/');
    await waitForHomePage(page);

    await page.locator('a[href*="/book/"]').first().click();
    await expect(page).toHaveURL(/\/book\/\d+/);

    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});

test.describe('User Journey: Error & Edge Cases', () => {
  test('attempting to view a non-existent book should not crash the app', async ({ page }) => {
    await page.goto('/book/99999');
    await waitForBookDetailPage(page);
    await expect(page.locator('body')).toBeVisible();
  });

  test('submitting add-book form twice creates two separate entries', async ({ page, request }) => {
    const title1 = `Duplicate A ${Date.now()}`;
    const title2 = `Duplicate B ${Date.now() + 1}`;

    for (const title of [title1, title2]) {
      await page.goto('/add-book');
      await waitForAddBookPage(page);
      await page.getByLabel(/title/i).fill(title);
      await page.getByLabel(/author/i).fill('Dup Author');
      const submitBtn = page
        .getByRole('button', { name: /add|submit|save/i })
        .or(page.locator('button[type="submit"]'))
        .first();
      await submitBtn.click();
      await waitForBookSubmission(page);
    }

    const booksResponse = await request.get('/api/books');
    const books = await booksResponse.json();
    const matchTitle1 = books.filter((book: { title: string }) => book.title === title1);
    const matchTitle2 = books.filter((book: { title: string }) => book.title === title2);

    expect(matchTitle1.length).toBeGreaterThanOrEqual(1);
    expect(matchTitle2.length).toBeGreaterThanOrEqual(1);
  });
});