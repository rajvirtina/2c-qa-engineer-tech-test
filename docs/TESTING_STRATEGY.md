
# Testing Strategy — Book Library Application

## Overview

This document describes the testing approach, rationale, and structure for the QA Engineer tech test. The goal is to provide thorough, maintainable test coverage that validates the application from multiple angles: the full user experience, API contracts, and individual unit behaviour.

## Test Pyramid Strategy

```
          ┌─────────────┐
          │   E2E (UI)  │   ← Playwright — user journeys, critical paths
          ├─────────────┤
          │    API      │   ← Playwright request context — contract tests
          ├─────────────┤
          │    Unit     │   ← Vitest — data store, validation, route logic
          └─────────────┘
```

Following the classic test pyramid, this suite keeps more tests at the lower levels (unit/API), which are faster and more deterministic, and fewer at the E2E level, which are slower but give the highest confidence in real user flows.

## Test Suite Structure

```
tests/
├── e2e/
│   ├── home.spec.ts
│   ├── book-detail.spec.ts
│   ├── add-book.spec.ts
│   ├── api.spec.ts
│   ├── user-journeys.spec.ts
│   ├── accessibility.spec.ts
│   └── pom.spec.ts
├── fixtures/
│   ├── fixtures.ts
│   └── page-objects.ts
└── unit/
    ├── api-books.test.ts
    ├── api-books-id.test.ts
    ├── books-data.test.ts
    ├── book-validation.test.ts
    └── setup.ts
```

## E2E Coverage

### `home.spec.ts`
- Page title and heading visible
- Book list and at least one book rendered
- Navigation to detail and add-book pages
- Mobile, tablet, and desktop viewport checks

### `book-detail.spec.ts`
- Title, author, genre, year, description, ISBN, pages, rating
- Back/home navigation
- Direct URL navigation
- Missing/non-numeric ID handling

### `add-book.spec.ts`
- Form structure and required fields
- Required field validation and whitespace rejection
- Happy path with required and full payloads
- Post-submit verification on home page

### `api.spec.ts`
- GET `/api/books` status, shape, types, content-type
- GET `/api/books/[id]` valid and invalid IDs
- POST `/api/books` success, error handling, retrievability

### `user-journeys.spec.ts`
- Browse to detail journey
- Add and verify on home page
- Add and navigate to detail
- Home/add-book/detail navigation flows
- Non-existent detail page resilience

### `accessibility.spec.ts`
- Main landmark and headings
- Accessible link text
- Label associations
- Keyboard navigation for key flows

## Unit Coverage

### `books-data.test.ts`
- `getBooks()` shape and seeded data
- `getBookById()` hit/miss behaviour
- `addBook()` ID generation, persistence, optional field preservation

### `api-books.test.ts`
- GET `/api/books`
- POST `/api/books` success and validation failures
- Error response contract

### `api-books-id.test.ts`
- GET `/api/books/[id]` success path
- 404 handling
- Non-numeric ID handling
- Response payload shape

### `book-validation.test.ts`
- Book shape validation
- Rating range validation
- Published year validation
- ISBN format length validation

## Design Decisions

- Semantic selectors are preferred over fragile style-based selectors.
- Timestamped book titles avoid collisions in parallel or repeated runs.
- Unit tests mock only the route-handler data store boundary; data-store tests use the real module.
- The home page now exposes list semantics and the app exposes a shared main landmark to support accessibility-focused tests.

## Running The Suite

```bash
npm install
npx playwright install
npm run test
npm run test:coverage
npm run test:e2e
```

## CI

The workflow at `.github/workflows/tests.yml` runs:

- Vitest with coverage
- Playwright E2E tests across Chromium, Firefox, and WebKit
- Artifact upload for coverage and Playwright reports
