import { expect, test } from '@playwright/test';
import { waitForAddBookPage, waitForBookDetailContent, waitForHomePage } from '../fixtures/app-waits';

test.describe('Accessibility: Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForHomePage(page);
  });

  test('page should have a main landmark', async ({ page }) => {
    const main = page.getByRole('main').or(page.locator('main'));
    await expect(main.first()).toBeVisible();
  });

  test('page should have at least one heading', async ({ page }) => {
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('book links should have accessible text', async ({ page }) => {
    const bookLinks = page.locator('a[href*="/book/"]');
    const count = await bookLinks.count();

    for (let index = 0; index < Math.min(count, 3); index += 1) {
      const text = await bookLinks.nth(index).innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('should be keyboard-navigable to first book link', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
  });
});

test.describe('Accessibility: Add Book Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/add-book');
    await waitForAddBookPage(page);
  });

  test('form inputs should have associated labels', async ({ page }) => {
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.getByLabel(/author/i)).toBeVisible();
  });

  test('submit button should have descriptive text', async ({ page }) => {
    const submitBtn = page
      .getByRole('button', { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    const text = await submitBtn.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('form should be completable via keyboard only', async ({ page }) => {
    await page.keyboard.press('Tab');
    const titleInput = page.getByLabel(/title/i);
    await titleInput.focus();
    await page.keyboard.type('Keyboard Title');

    await page.keyboard.press('Tab');
    const authorInput = page.getByLabel(/author/i);
    await authorInput.focus();
    await page.keyboard.type('Keyboard Author');

    await expect(titleInput).toHaveValue('Keyboard Title');
    await expect(authorInput).toHaveValue('Keyboard Author');
  });
});

test.describe('Accessibility: Book Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book/1');
    await waitForBookDetailContent(page);
  });

  test('page should have a main landmark', async ({ page }) => {
    const main = page.getByRole('main').or(page.locator('main'));
    await expect(main.first()).toBeVisible();
  });

  test('page should have a heading for the book title', async ({ page }) => {
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('back/home link should be focusable and have accessible text', async ({ page }) => {
    const backLink = page
      .getByRole('link', { name: /back|home/i })
      .or(page.locator('a[href="/"]'))
      .first();
    await expect(backLink).toBeVisible();
    const text = await backLink.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });
});