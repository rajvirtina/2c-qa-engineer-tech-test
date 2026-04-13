# QA Engineer Tech Test - Book Library Application

## Overview

This is a technical test for QA Engineer applicants. The application is a simple book library built with Next.js that allows users to view a list of books, see detailed information about individual books, and add new books to the library.

## Application Features

### Core Functionality
- **Home Page**: Displays a list of all books with basic information (title, author, genre, rating, etc.)
- **Book Detail Page**: Shows comprehensive information about a specific book when clicked
- **Add Book Form**: Allows users to add new books to the library with validation

### Technical Stack
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes (fake backend with in-memory storage)
- **Testing**: Playwright (E2E) and Vitest (Unit) configured and ready to use

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Install Playwright browsers:
   ```bash
    npx playwright install
    ```
6. Run unit tests
   ```bash
    npm run test
    ```

7. Run E2E tests (auto-starts dev server):
   ```bash
    npm run test:e2e
    ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests with Vitest
- `npm run test:e2e` - Run E2E tests with Playwright

## API Endpoints

### GET /api/books
Returns a list of all books

**Response:**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Classic",
    "publishedYear": 1925,
    "description": "A story of decadence and excess...",
    "isbn": "978-0743273565",
    "pages": 180,
    "rating": 4.2
  }
]
```

### GET /api/books/[id]
Returns details of a specific book by ID

**Response:**
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Classic",
  "publishedYear": 1925,
  "description": "A story of decadence and excess...",
  "isbn": "978-0743273565",
  "pages": 180,
  "rating": 4.2
}
```

### POST /api/books
Adds a new book to the library

**Request Body:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "genre": "Fiction",
  "publishedYear": 2024,
  "description": "Book description",
  "isbn": "978-1234567890",
  "pages": 300,
  "rating": 4.5
}
```

**Required Fields:** `title`, `author`


## What's Been Added

| Path | Description |
|------|-------------|
| `tests/e2e/home.spec.ts` | Home page layout, book list, navigation, responsive |
| `tests/e2e/book-detail.spec.ts` | Detail page content, 404 handling, navigation |
| `tests/e2e/add-book.spec.ts` | Form validation, happy paths, UX checks |
| `tests/e2e/api.spec.ts` | HTTP-level API contract tests (GET & POST) |
| `tests/e2e/user-journeys.spec.ts` | Multi-page end-to-end user flows |
| `tests/e2e/accessibility.spec.ts` | ARIA roles, keyboard nav, label associations |
| `tests/unit/api-books.test.ts` | Unit tests for /api/books route handler |
| `tests/unit/api-books-id.test.ts` | Unit tests for /api/books/[id] route handler |
| `tests/unit/books-data.test.ts` | Unit tests for the in-memory data store |
| `tests/unit/book-validation.test.ts` | Pure validation logic tests |
| `tests/unit/setup.ts` | Global Vitest setup (fetch polyfill, jest-dom) |
| `playwright.config.ts` | Playwright configuration (5 browser/device projects) |
| `vitest.config.ts` | Vitest configuration with path aliases and coverage |
| `tests/e2e/pom.spec.ts` | POM-based tests demonstrating the fixture pattern |
| `tests/fixtures/page-objects.ts` | Page Object Models (HomePage, BookDetailPage, AddBookPage) |
| `tests/fixtures/fixtures.ts` | Custom Playwright fixtures wiring up POMs |
| `.github/workflows/tests.yml` | GitHub Actions CI — unit + E2E across 3 browsers |
| `docs/TESTING_STRATEGY.md` | Full testing strategy and rationale |
| `docs/PACKAGE_JSON_ADDITIONS.md` | Scripts and dev deps added to package.json |

## Test Count Summary

| Layer | File | Tests |
|-------|------|-------|
| E2E | home.spec.ts | 11 |
| E2E | book-detail.spec.ts | 13 |
| E2E | add-book.spec.ts | 16 |
| E2E | api.spec.ts | 19 |
| E2E | user-journeys.spec.ts | 8 |
| E2E | accessibility.spec.ts | 10 |
| Unit | api-books.test.ts | 10 |
| Unit | api-books-id.test.ts | 6 |
| Unit | books-data.test.ts | 13 |
| Unit | book-validation.test.ts | 25 |
| E2E | pom.spec.ts | 8 |
| **Total** | | **~139** |


### Useful Commands

1. E2E — specific spec
   ```bash
   npm run test:e2e -- tests/e2e/add-book.spec.ts
   ```

2. E2E — single browser
   ```bash
   npm run test:e2e -- --project=chromium
   ```

3. E2E — headed (see the browser)
    ```bash
    npm run test:e2e -- --headed
    ```

4. E2E — debug mode
   ```bash
    npm run test:e2e -- --debug
    ```
5. View HTML report after E2E run
   ```bash
    npx playwright show-report
    ```

6. Unit tests with coverage
   ```bash
    npm run test:coverage
    ```
## Full Documentation

See [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) for the test pyramid rationale, per-file scenario breakdowns, design decisions, and known limitations.

Full test plan and inventory: [`TEST_PLAN.md`](docs/TEST_PLAN.md)

