# Bug Report: API & Frontend Issues

## Summary

| # | Title | Severity | Priority |
|---|-------|----------|----------|
| 1 | No backend validation for numeric business rules | Critical | P1 |
| 2 | In-memory storage causes data loss on restart / deployment | Critical | P1 |
| 3 | No duplicate prevention | High | P1 |
| 4 | API accepts unbounded text input | High | P1 |
| 5 | Frontend numeric parsing still weak for edge cases | High | P2 |
| 6 | Missing API error detail standardization | High | P2 |
| 7 | Optional numeric defaults become misleading on display | Medium | P2 |
| 8 | No loading / retry UX for failed API on home page | Medium | P2 |
| 9 | Potential race condition in ID generation | Medium | P2 |
| 10 | Missing accessibility polish | Low | P3 |
| 11 | No security hardening for API abuse | Low | P3 |

---

## Critical Severity

### 1. No backend validation for numeric business rules

**Severity:** Critical — **Priority:** P1

#### Problem

The API only validates:

- `title` exists
- `author` exists

But it does not validate:

- Rating range (0–5)
- Pages > 0
- Published year not in the future
- ISBN format

#### Impact

Invalid data can be stored:

- `rating = 100`
- `pages = -50`
- `year = 9999`

This corrupts data integrity.


### 2. In-memory storage causes data loss on restart / deployment

**Severity:** Critical — **Priority:** P1

#### Problem

Books are stored only in memory:

```js
globalThis.__BOOKS_DATA__
```

#### Impact

Data is lost after:

- Restart
- Redeploy
- Crash

Not scalable, not production-safe.



## High Severity

### 3. No duplicate prevention

**Severity:** High — **Priority:** P1

#### Problem

The same book can be added multiple times with:

- Same title
- Same author
- Same ISBN

#### Impact

Duplicate catalog records.



### 4. API accepts unbounded text input

**Severity:** High — **Priority:** P1

#### Problem

No maximum length validation on:

- `title`
- `description`
- `author`

#### Impact

Can:

- Break UI layout
- Increase memory usage
- Allow abuse payloads


### 5. Frontend numeric parsing still weak for edge cases

**Severity:** High — **Priority:** P2

#### Problem

The form uses:

```js
parseInt()
parseFloat()
```

These still allow:

- Spaces
- Malformed decimals (e.g. `"4..5"`, `"  "`)

#### Impact

Unexpected `undefined` values and inconsistent UI behaviour.


### 6. Missing API error detail standardization

**Severity:** High — **Priority:** P2

#### Problem

Error responses are inconsistent — some return `400`, some `404`, with generic messages.

#### Impact

Makes it difficult for the frontend to handle errors properly or map them to specific fields.


## Medium Severity

### 7. Optional numeric defaults become misleading on display

**Severity:** Medium — **Priority:** P2

#### Problem

Missing `pages` or `rating` values default to `0`.

#### Impact

The UI shows `"0 pages"` and a fake zero rating, which is misleading to users.



### 8. No loading / retry UX for failed API on home page

**Severity:** Medium — **Priority:** P2

#### Problem

The home page lacks:

- Skeleton / loading state
- Retry button
- Clear fallback message

#### Impact

Poor resilience — users see a blank state with no explanation.


### 9. Potential race condition in ID generation

**Severity:** Medium — **Priority:** P2

#### Problem

ID generation uses:

```js
Math.max(...booksData.map()) + 1
```

#### Impact

Parallel requests can produce duplicate IDs.



## Low Severity

### 10. Missing accessibility polish

**Severity:** Low — **Priority:** P3

#### Problem

A good accessibility base exists, but missing:

- `aria-live` on success messages
- Better error announcements

#### Impact

Screen reader UX is weaker than it could be.


### 11. No security hardening for API abuse

**Severity:** Low — **Priority:** P3

#### Problem

Missing:

- Rate limiting
- CSRF protection

#### Impact

API is vulnerable to abuse in a real deployment.