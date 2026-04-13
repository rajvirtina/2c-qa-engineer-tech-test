import { expect, type Locator, type Page } from '@playwright/test';
import {
  waitForAddBookPage,
  waitForBookDetailContent,
  waitForBookSubmission,
  waitForHomePage,
} from './app-waits';

async function fillTextLikeControl(locator: Locator, value: string) {
  const tagName = await locator.evaluate((element) => element.tagName.toLowerCase());

  if (tagName === 'select') {
    await locator.selectOption({ label: value });
    return;
  }

  await locator.fill(value);
}

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly bookLinks: Locator;
  readonly addBookNavLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.bookLinks = page.locator('a[href*="/book/"]');
    this.addBookNavLink = page.getByRole('link', { name: /add/i }).first();
  }

  async goto() {
    await this.page.goto('/');
    await waitForHomePage(this.page);
  }

  async clickFirstBook() {
    await this.bookLinks.first().click();
    await waitForBookDetailContent(this.page);
  }

  async clickAddBook() {
    await this.addBookNavLink.click();
    await waitForAddBookPage(this.page);
  }

  async getBookCount(): Promise<number> {
    return this.bookLinks.count();
  }

  async hasBookWithTitle(title: string): Promise<boolean> {
    return this.page.getByText(title).isVisible().catch(() => false);
  }

  async waitForBook(title: string, timeout = 10_000) {
    await expect(this.page.getByText(title)).toBeVisible({ timeout });
  }
}

export class BookDetailPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly authorText: Locator;
  readonly backLink: Locator;
  readonly bodyText: () => Promise<string>;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading').first();
    this.authorText = page.getByText(/^by\s+.+/i).first();
    this.backLink = page
      .getByRole('link', { name: /back|home/i })
      .or(page.locator('a[href="/"]'))
      .first();
    this.bodyText = () => page.locator('body').innerText();
  }

  async goto(id: number) {
    await this.page.goto(`/book/${id}`);
    await waitForBookDetailContent(this.page);
  }

  async clickBack() {
    await this.backLink.click();
    await waitForHomePage(this.page);
  }

  async getTitle(): Promise<string> {
    return this.heading.innerText();
  }

  async hasField(label: RegExp): Promise<boolean> {
    const text = await this.bodyText();
    return label.test(text);
  }

  async hasAuthorInfo(): Promise<boolean> {
    return this.authorText.isVisible().catch(() => false);
  }
}

export class AddBookPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly authorInput: Locator;
  readonly genreInput: Locator;
  readonly yearInput: Locator;
  readonly descriptionInput: Locator;
  readonly isbnInput: Locator;
  readonly pagesInput: Locator;
  readonly ratingInput: Locator;
  readonly submitButton: Locator;
  readonly homeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel(/title/i);
    this.authorInput = page.getByLabel(/author/i);
    this.genreInput = page.getByLabel(/genre/i);
    this.yearInput = page.getByLabel(/year/i);
    this.descriptionInput = page.getByLabel(/description/i);
    this.isbnInput = page.getByLabel(/isbn/i);
    this.pagesInput = page.getByLabel(/pages/i);
    this.ratingInput = page.getByLabel(/rating/i);
    this.submitButton = page
      .getByRole('button', { name: /add|submit|save/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    this.homeLink = page
      .getByRole('link', { name: /home|back/i })
      .or(page.locator('a[href="/"]'))
      .first();
  }

  async goto() {
    await this.page.goto('/add-book');
    await waitForAddBookPage(this.page);
  }

  async fillRequired(title: string, author: string) {
    await this.titleInput.fill(title);
    await this.authorInput.fill(author);
  }

  async fillAll(data: {
    title: string;
    author: string;
    genre?: string;
    year?: string;
    description?: string;
    isbn?: string;
    pages?: string;
    rating?: string;
  }) {
    await this.titleInput.fill(data.title);
    await this.authorInput.fill(data.author);

    if (data.genre && (await this.genreInput.isVisible().catch(() => false))) {
      await fillTextLikeControl(this.genreInput, data.genre);
    }

    if (data.year && (await this.yearInput.isVisible().catch(() => false))) {
      await this.yearInput.fill(data.year);
    }

    if (data.description && (await this.descriptionInput.isVisible().catch(() => false))) {
      await this.descriptionInput.fill(data.description);
    }

    if (data.isbn && (await this.isbnInput.isVisible().catch(() => false))) {
      await this.isbnInput.fill(data.isbn);
    }

    if (data.pages && (await this.pagesInput.isVisible().catch(() => false))) {
      await this.pagesInput.fill(data.pages);
    }

    if (data.rating && (await this.ratingInput.isVisible().catch(() => false))) {
      await this.ratingInput.fill(data.rating);
    }
  }

  async submit(waitForCompletion = true) {
    await this.submitButton.click();

    if (waitForCompletion) {
      await waitForBookSubmission(this.page);
    }
  }

  async fillAndSubmit(title: string, author: string) {
    await this.fillRequired(title, author);
    await this.submit();
  }

  async wasSubmitSuccessful(): Promise<boolean> {
    const onAddPage = this.page.url().includes('/add-book');

    if (!onAddPage) {
      return true;
    }

    return this.page.getByText(/success|added|created/i).isVisible().catch(() => false);
  }
}