# Test Plan

## Objective

This test plan describes how the Book Library application is validated for the QA Engineer technical test. The goal is to provide practical confidence in the core user flows, API behavior, and business rules with a balanced automated suite.

The application under test supports three primary user journeys:

1. Browse the list of books on the home page.
2. Open a book detail page and review its metadata.
3. Add a new book through the form and confirm it is persisted in the in-memory store.

## Scope

### In scope

- Home page rendering and navigation
- Book detail rendering and direct URL access
- Add-book form behavior, submission, and validation
- API contract coverage for `GET /api/books`, `GET /api/books/[id]`, and `POST /api/books`
- In-memory data-store behavior and validation logic
- Basic accessibility checks for landmarks, labels, accessible text, and keyboard interaction
- Responsive checks for key pages

### Out of scope

- Performance or load testing
- Visual regression or screenshot comparison
- Security or penetration testing
- Real database integration testing
- Browser-specific defect analysis beyond the configured Playwright projects

## Test Approach

The suite follows a test-pyramid approach so that most assertions sit at lower-cost layers and only critical user behavior is covered end to end.

### Unit tests with Vitest

Unit tests validate the fastest and most deterministic parts of the application:

- Route-handler responses and validation behavior
- In-memory data-store functions such as `getBooks`, `getBookById`, and `addBook`
- Pure validation rules for book shape, rating, year, and ISBN

These tests are intended to catch logic regressions early and provide fast feedback during development.

### End-to-end and API tests with Playwright

Playwright is used in two ways:

- Browser-based E2E coverage for real user journeys across the UI
- Request-context API coverage for HTTP contract validation

The browser suite focuses on the paths most important to a user:

- Viewing books on the home page
- Navigating to a book detail page
- Adding books with required and full payloads
- Handling common error and validation states
- Verifying accessibility basics and responsive behavior

### Design principles

- Prefer semantic selectors over fragile CSS selectors
- Use timestamped test data to avoid collisions
- Keep unit tests isolated where mocking is useful, but use the real data module where persistence behavior matters
- Cover both happy paths and realistic negative cases

## Coverage Summary

The active automated suite currently includes:

- Vitest unit coverage for route handlers, data store behavior, and validation rules
- Playwright coverage for home, detail, add-book, API, accessibility, user-journey, and POM flows
- CI execution for unit tests and Playwright browser runs

For the detailed case inventory, see `docs/TEST_CASES_INVENTORY.md`.

## Environments and Tools

- Framework: Next.js
- Unit runner: Vitest
- E2E and API runner: Playwright
- Target runtime: local development server started with `npm run dev`
- Supported browser projects in Playwright config:
  - Chromium
  - Firefox
  - WebKit
  - Mobile Chrome
  - Mobile Safari

## How To Run

### Install dependencies

```bash
npm install
npx playwright install
```

### Run unit tests

```bash
npm run test
```

### Run unit tests with coverage

```bash
npm run test:coverage
```

### Run Playwright E2E and API tests

```bash
npm run test:e2e
```

### Useful variants

```bash
npm run test:e2e:headed
npm run test:e2e:debug
npm run test:e2e:chromium
npm run test:all
```

## Entry and Exit Expectations

### Entry

- Dependencies install successfully
- Playwright browsers are installed
- The application starts locally
- Seed book data is available

### Exit

- Unit tests pass
- Active Playwright suite passes
- Critical flows are validated:
  - Home page loads and renders books
  - Detail page renders book information
  - Add-book form creates books successfully
  - Required field validation blocks invalid submissions
  - API routes return expected status codes and payloads

## Risks and Gaps

Current known gaps or limitations:

1. There are no active component-level React tests under `src/app/__tests__`.
2. Performance, visual regression, and security testing are not included.
3. The application uses an in-memory store, so persistence only covers the running process and not a real backing database.
4. Two additional authored browser-style spec files exist in `tests/unit`, but they are not active under the current runner configuration.
5. Cross-browser execution is configured, but browser-specific defect reporting is not documented separately.

## Deliverables

This submission includes:

- Automated unit tests
- Automated Playwright E2E, API, accessibility, and POM tests
- A testing strategy document in `docs/TESTING_STRATEGY.md`
- A detailed case inventory in `docs/TEST_CASES_INVENTORY.md`
- This summary test plan as supporting documentation
