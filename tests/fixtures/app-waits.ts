import { expect, type Page } from '@playwright/test';

export async function waitForHomePage(page: Page) {
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function waitForAddBookPage(page: Page) {
  const titleInput = page.getByLabel(/title/i);

  await expect(page).toHaveURL(/\/add-book$/);
  await expect(titleInput).toBeVisible();
  await expect(page.getByLabel(/author/i)).toBeVisible();

  // This page is a client component with controlled inputs. On slower engines,
  // the DOM can appear before hydration completes, which causes early fills to be lost.
  const readinessProbe = '__pw_ready__';
  await titleInput.fill(readinessProbe);
  await expect(titleInput).toHaveValue(readinessProbe);
  await titleInput.clear();
  await expect(titleInput).toHaveValue('');
}

export async function waitForBookDetailPage(page: Page) {
  await expect(page).toHaveURL(/\/book\/[^/]+$/);
  await expect(page.locator('body')).toBeVisible();
}

export async function waitForBookDetailContent(page: Page) {
  await waitForBookDetailPage(page);
  await expect(page.getByRole('heading').first()).toBeVisible();
}

export async function waitForBookSubmission(page: Page) {
  await expect
    .poll(async () => {
      if (!page.url().includes('/add-book')) {
        return 'navigated';
      }

      const successMessage = page.getByText(/success|added|created|redirecting/i).first();
      if (await successMessage.isVisible().catch(() => false)) {
        return 'success';
      }

      const errorMessage = page.locator('[class*="red"], [role="alert"], .error').filter({ hasText: /failed|error|required|invalid/i }).first();
      if (await errorMessage.isVisible().catch(() => false)) {
        const errorText = (await errorMessage.innerText().catch(() => '')).trim();
        return `error:${errorText || 'unknown'}`;
      }

      return 'pending';
    }, {
      timeout: 15_000,
      intervals: [250, 500, 1_000],
    })
    .toMatch(/^(success|navigated)$/);
}