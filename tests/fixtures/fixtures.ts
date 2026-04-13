import { test as base } from '@playwright/test';
import { AddBookPage, BookDetailPage, HomePage } from './page-objects';

type BookLibraryFixtures = {
  homePage: HomePage;
  bookDetailPage: BookDetailPage;
  addBookPage: AddBookPage;
};

export const test = base.extend<BookLibraryFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  bookDetailPage: async ({ page }, use) => {
    await use(new BookDetailPage(page));
  },
  addBookPage: async ({ page }, use) => {
    await use(new AddBookPage(page));
  },
});

export { expect } from '@playwright/test';