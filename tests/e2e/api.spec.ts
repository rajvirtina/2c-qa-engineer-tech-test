import { expect, test } from '@playwright/test';

test.describe('API: GET /api/books', () => {
  test('should return 200 with an array of books', async ({ request }) => {
    const response = await request.get('/api/books');
    expect(response.status()).toBe(200);

    const books = await response.json();
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBeGreaterThan(0);
  });

  test('each book should have the required fields', async ({ request }) => {
    const response = await request.get('/api/books');
    const books = await response.json();

    for (const book of books) {
      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
    }
  });

  test('should return books with correct data types', async ({ request }) => {
    const response = await request.get('/api/books');
    const books = await response.json();
    const book = books[0];

    expect(typeof book.id).toBe('number');
    expect(typeof book.title).toBe('string');
    expect(typeof book.author).toBe('string');

    if (book.rating !== undefined) {
      expect(typeof book.rating).toBe('number');
    }

    if (book.pages !== undefined) {
      expect(typeof book.pages).toBe('number');
    }

    if (book.publishedYear !== undefined) {
      expect(typeof book.publishedYear).toBe('number');
    }
  });

  test('response content-type should be application/json', async ({ request }) => {
    const response = await request.get('/api/books');
    expect(response.headers()['content-type']).toContain('application/json');
  });
});

test.describe('API: GET /api/books/[id]', () => {
  test('should return 200 and a single book for a valid ID', async ({ request }) => {
    const response = await request.get('/api/books/1');
    expect(response.status()).toBe(200);

    const book = await response.json();
    expect(book).toHaveProperty('id', 1);
    expect(book).toHaveProperty('title');
    expect(book).toHaveProperty('author');
  });

  test('should return 404 for a non-existent book ID', async ({ request }) => {
    const response = await request.get('/api/books/99999');
    expect(response.status()).toBe(404);
  });

  test('should return a proper error body on 404', async ({ request }) => {
    const response = await request.get('/api/books/99999');
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('should return 400 or 404 for a non-numeric ID', async ({ request }) => {
    const response = await request.get('/api/books/not-a-number');
    expect([400, 404].includes(response.status())).toBeTruthy();
  });

  test('should return consistent data between list and detail endpoints', async ({ request }) => {
    const listResponse = await request.get('/api/books');
    const books = await listResponse.json();
    const firstBookId = books[0].id;

    const detailResponse = await request.get(`/api/books/${firstBookId}`);
    const detail = await detailResponse.json();

    expect(detail.id).toBe(books[0].id);
    expect(detail.title).toBe(books[0].title);
    expect(detail.author).toBe(books[0].author);
  });
});

test.describe('API: POST /api/books', () => {
  test('should create a new book with required fields only', async ({ request }) => {
    const newBook = {
      title: `API Test Book ${Date.now()}`,
      author: 'API Test Author',
    };

    const response = await request.post('/api/books', { data: newBook });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created).toHaveProperty('id');
    expect(created.title).toBe(newBook.title);
    expect(created.author).toBe(newBook.author);
  });

  test('should create a new book with all fields', async ({ request }) => {
    const newBook = {
      title: `Full Book ${Date.now()}`,
      author: 'Full Author',
      genre: 'Science Fiction',
      publishedYear: 2024,
      description: 'A comprehensive API test book.',
      isbn: '978-1234567890',
      pages: 350,
      rating: 4.7,
    };

    const response = await request.post('/api/books', { data: newBook });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created.title).toBe(newBook.title);
    expect(created.author).toBe(newBook.author);
    expect(created.genre).toBe(newBook.genre);
    expect(created.pages).toBe(newBook.pages);
    expect(created.rating).toBe(newBook.rating);
  });

  test('created book should be retrievable via GET', async ({ request }) => {
    const newBook = {
      title: `Retrievable Book ${Date.now()}`,
      author: 'Retrievable Author',
    };

    const postResponse = await request.post('/api/books', { data: newBook });
    const created = await postResponse.json();

    const getResponse = await request.get(`/api/books/${created.id}`);
    expect(getResponse.status()).toBe(200);

    const fetched = await getResponse.json();
    expect(fetched.title).toBe(newBook.title);
  });

  test('should return 400 when title is missing', async ({ request }) => {
    const response = await request.post('/api/books', {
      data: { author: 'No Title Author' },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 when author is missing', async ({ request }) => {
    const response = await request.post('/api/books', {
      data: { title: 'No Author Book' },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 when body is empty', async ({ request }) => {
    const response = await request.post('/api/books', { data: {} });
    expect(response.status()).toBe(400);
  });

  test('error response should include a meaningful message', async ({ request }) => {
    const response = await request.post('/api/books', { data: {} });
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
  });

  test('created book should have an auto-assigned numeric ID', async ({ request }) => {
    const response = await request.post('/api/books', {
      data: { title: 'ID Test Book', author: 'ID Author' },
    });
    const created = await response.json();
    expect(typeof created.id).toBe('number');
    expect(created.id).toBeGreaterThan(0);
  });

  test('should return 400 for title that is empty string', async ({ request }) => {
    const response = await request.post('/api/books', {
      data: { title: '', author: 'Some Author' },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 for author that is empty string', async ({ request }) => {
    const response = await request.post('/api/books', {
      data: { title: 'Some Title', author: '' },
    });
    expect(response.status()).toBe(400);
  });
});