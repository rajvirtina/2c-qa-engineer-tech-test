import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/books-data', () => {
  const books = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Classic',
      publishedYear: 1925,
      description: 'A story of decadence.',
      isbn: '978-0743273565',
      pages: 180,
      rating: 4.2,
    },
    {
      id: 2,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Classic',
      publishedYear: 1960,
      description: 'A story of racial injustice.',
      isbn: '978-0061935466',
      pages: 336,
      rating: 4.8,
    },
  ];

  return {
    getBooks: vi.fn(() => [...books]),
    getBookById: vi.fn((id: number) => books.find((book) => book.id === id) ?? null),
    addBook: vi.fn((data: Record<string, unknown>) => ({ id: 99, ...data })),
  };
});

function makeRequest(method: string, body?: object): Request {
  return new Request('http://localhost:3000/api/books', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('API Route: GET /api/books', () => {
  it('returns 200 with an array of books', async () => {
    const { GET } = await import('@/app/api/books/route');
    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('each book in the response has required fields', async () => {
    const { GET } = await import('@/app/api/books/route');
    const res = await GET();
    const books = await res.json();

    for (const book of books) {
      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
    }
  });
});

describe('API Route: POST /api/books', () => {
  it('returns 201 with the created book when title and author are provided', async () => {
    const { POST } = await import('@/app/api/books/route');
    const req = makeRequest('POST', { title: 'New Book', author: 'New Author' });
    const res = await POST(req as never);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe('New Book');
    expect(body.author).toBe('New Author');
  });

  it('returns 400 when title is missing', async () => {
    const { POST } = await import('@/app/api/books/route');
    const req = makeRequest('POST', { author: 'Author Only' });
    const res = await POST(req as never);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 when author is missing', async () => {
    const { POST } = await import('@/app/api/books/route');
    const req = makeRequest('POST', { title: 'Title Only' });
    const res = await POST(req as never);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 when body is completely empty', async () => {
    const { POST } = await import('@/app/api/books/route');
    const req = makeRequest('POST', {});
    const res = await POST(req as never);

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is an empty string', async () => {
    const { POST } = await import('@/app/api/books/route');
    const req = makeRequest('POST', { title: '', author: 'Valid Author' });
    const res = await POST(req as never);

    expect(res.status).toBe(400);
  });

  it('returns 400 when author is an empty string', async () => {
    const { POST } = await import('@/app/api/books/route');
    const req = makeRequest('POST', { title: 'Valid Title', author: '' });
    const res = await POST(req as never);

    expect(res.status).toBe(400);
  });

  it('returns 400 when only whitespace is provided for required fields', async () => {
    const { POST } = await import('@/app/api/books/route');
    const req = makeRequest('POST', { title: '   ', author: '   ' });
    const res = await POST(req as never);

    expect(res.status).toBe(400);
  });

  it("error response body contains an 'error' string property", async () => {
    const { POST } = await import('@/app/api/books/route');
    const req = makeRequest('POST', {});
    const res = await POST(req as never);
    const body = await res.json();

    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
  });
});