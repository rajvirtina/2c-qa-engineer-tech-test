import { expect, test } from '../fixtures/fixtures';
import { waitForBookDetailContent } from '../fixtures/app-waits';

test.describe('POM: Home Page', () => {
  test('should display books and allow navigating to detail', async ({ homePage }) => {
    await homePage.goto();
    const count = await homePage.getBookCount();
    expect(count).toBeGreaterThan(0);

    await homePage.clickFirstBook();
    await expect(homePage.page).toHaveURL(/\/book\/\d+/);
  });

  test('should navigate to add-book page', async ({ homePage }) => {
    await homePage.goto();
    await homePage.clickAddBook();
    await expect(homePage.page).toHaveURL(/add-book/);
  });
});

test.describe('POM: Add Book Page', () => {
  test('should add a book with required fields and confirm on home page', async ({ addBookPage, homePage }) => {
    const title = `POM Book ${Date.now()}`;
    await addBookPage.goto();
    await addBookPage.fillAndSubmit(title, 'POM Author');

    const success = await addBookPage.wasSubmitSuccessful();
    expect(success).toBe(true);

    await homePage.goto();
    const visible = await homePage.hasBookWithTitle(title);
    expect(visible).toBe(true);
  });

  test('should add a book with all fields', async ({ addBookPage, homePage }) => {
    const title = `POM Full Book ${Date.now()}`;
    await addBookPage.goto();
    await addBookPage.fillAll({
      title,
      author: 'POM Full Author',
      genre: 'Science Fiction',
      year: '2024',
      description: 'Written using the Page Object Model pattern.',
      isbn: '978-1234567890',
      pages: '320',
      rating: '4.5',
    });
    await addBookPage.submit();

    const success = await addBookPage.wasSubmitSuccessful();
    expect(success).toBe(true);

    await homePage.goto();
    await homePage.waitForBook(title);
  });

  test('should not submit when title is empty', async ({ addBookPage }) => {
    await addBookPage.goto();
    await addBookPage.authorInput.fill('Author Without Title');
    await addBookPage.submit(false);
    await expect(addBookPage.page).toHaveURL(/add-book/);
  });
});

test.describe('POM: Book Detail Page', () => {
  test('should display book details for ID 1', async ({ bookDetailPage }) => {
    await bookDetailPage.goto(1);
    await expect(bookDetailPage.heading).toBeVisible();
    const title = await bookDetailPage.getTitle();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display author info', async ({ bookDetailPage }) => {
    await bookDetailPage.goto(1);
    expect(await bookDetailPage.hasAuthorInfo()).toBe(true);
  });

  test('should navigate home via back link', async ({ bookDetailPage }) => {
    await bookDetailPage.goto(1);
    await bookDetailPage.clickBack();
    await expect(bookDetailPage.page).toHaveURL('/');
  });
});

test.describe('POM: Full User Journey', () => {
  test('user adds a book and immediately views its detail page', async ({ addBookPage, homePage }) => {
    const title = `Journey POM ${Date.now()}`;

    await addBookPage.goto();
    await addBookPage.fillAndSubmit(title, 'Journey Author');
    expect(await addBookPage.wasSubmitSuccessful()).toBe(true);

    await homePage.goto();
    await homePage.waitForBook(title);

    const bookAnchor = homePage.page.locator('a[href*="/book/"]').filter({ hasText: title }).first();
    if ((await bookAnchor.count()) > 0) {
      await bookAnchor.click();
    } else {
      await homePage.page.getByText(title).first().click();
    }

    await waitForBookDetailContent(homePage.page);
    await expect(homePage.page).toHaveURL(/\/book\/\d+/);
    await expect(homePage.page.getByText(title)).toBeVisible();
  });
});