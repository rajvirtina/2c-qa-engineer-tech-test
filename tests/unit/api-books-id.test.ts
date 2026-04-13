import { describe, expect, it, vi } from 'vitest';

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
  ];

  return {
    getBooks: vi.fn(() => [...books]),
    getBookById: vi.fn((id: number) => books.find((book) => book.id === id) ?? null),
    addBook: vi.fn(),
  };
});

describe('API Route: GET /api/books/[id]', () => {
  it('returns 200 with the correct book for a valid ID', async () => {
    const { GET } = await import('@/app/api/books/[id]/route');
    const req = new Request('http://localhost:3000/api/books/1');
    const res = await GET(req as never, { params: Promise.resolve({ id: '1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.title).toBe('The Great Gatsby');
  });

  it('returns 404 for a non-existent book ID', async () => {
    const { GET } = await import('@/app/api/books/[id]/route');
    const req = new Request('http://localhost:3000/api/books/9999');
    const res = await GET(req as never, { params: Promise.resolve({ id: '9999' }) });

    expect(res.status).toBe(404);
  });

  it('returns an error body on 404', async () => {
    const { GET } = await import('@/app/api/books/[id]/route');
    const req = new Request('http://localhost:3000/api/books/9999');
    const res = await GET(req as never, { params: Promise.resolve({ id: '9999' }) });
    const body = await res.json();

    expect(body).toBeDefined();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 or 404 for a non-numeric ID', async () => {
    const { GET } = await import('@/app/api/books/[id]/route');
    const req = new Request('http://localhost:3000/api/books/abc');
    const res = await GET(req as never, { params: Promise.resolve({ id: 'abc' }) });

    expect([400, 404]).toContain(res.status);
  });

  it('response has content-type application/json', async () => {
    const { GET } = await import('@/app/api/books/[id]/route');
    const req = new Request('http://localhost:3000/api/books/1');
    const res = await GET(req as never, { params: Promise.resolve({ id: '1' }) });

    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('returned book has all expected fields', async () => {
    const { GET } = await import('@/app/api/books/[id]/route');
    const req = new Request('http://localhost:3000/api/books/1');
    const res = await GET(req as never, { params: Promise.resolve({ id: '1' }) });
    const book = await res.json();

    expect(book).toHaveProperty('id');
    expect(book).toHaveProperty('title');
    expect(book).toHaveProperty('author');
    expect(book).toHaveProperty('genre');
    expect(book).toHaveProperty('publishedYear');
    expect(book).toHaveProperty('description');
    expect(book).toHaveProperty('isbn');
    expect(book).toHaveProperty('pages');
    expect(book).toHaveProperty('rating');
  });
});