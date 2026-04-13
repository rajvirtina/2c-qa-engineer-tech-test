import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

describe('books-data: getBooks', () => {
  it('returns an array', async () => {
    const { getBooks } = await import('@/lib/books-data');
    const result = getBooks();
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns at least one pre-seeded book', async () => {
    const { getBooks } = await import('@/lib/books-data');
    const result = getBooks();
    expect(result.length).toBeGreaterThan(0);
  });

  it('each book has id, title, and author properties', async () => {
    const { getBooks } = await import('@/lib/books-data');
    const books = getBooks();
    for (const book of books) {
      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
    }
  });

  it('IDs are unique', async () => {
    const { getBooks } = await import('@/lib/books-data');
    const books = getBooks();
    const ids = books.map((book) => book.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('books-data: getBookById', () => {
  it('returns the correct book for a valid ID', async () => {
    const { getBooks, getBookById } = await import('@/lib/books-data');
    const books = getBooks();
    const firstId = books[0].id;

    const result = getBookById(firstId);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(firstId);
  });

  it('returns null for a non-existent ID', async () => {
    const { getBookById } = await import('@/lib/books-data');
    const result = getBookById(99999);
    expect(result).toBeNull();
  });

  it('returns null for a negative ID', async () => {
    const { getBookById } = await import('@/lib/books-data');
    const result = getBookById(-1);
    expect(result).toBeNull();
  });
});

describe('books-data: addBook', () => {
  it('adds a new book and returns it with an ID', async () => {
    const { addBook } = await import('@/lib/books-data');
    const newBook = { title: 'New Book', author: 'New Author' };
    const result = addBook(newBook);

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
    expect(result.title).toBe(newBook.title);
    expect(result.author).toBe(newBook.author);
  });

  it('new book appears in getBooks after being added', async () => {
    const { addBook, getBooks } = await import('@/lib/books-data');
    const before = getBooks().length;

    addBook({ title: 'Added Book', author: 'Added Author' });

    const after = getBooks();
    expect(after.length).toBe(before + 1);
  });

  it('assigns a unique ID to each new book', async () => {
    const { addBook } = await import('@/lib/books-data');
    const book1 = addBook({ title: 'Book A', author: 'Author A' });
    const book2 = addBook({ title: 'Book B', author: 'Author B' });

    expect(book1.id).not.toBe(book2.id);
  });

  it('new book is retrievable via getBookById', async () => {
    const { addBook, getBookById } = await import('@/lib/books-data');
    const added = addBook({ title: 'Findable', author: 'Findable Author' });
    const found = getBookById(added.id);

    expect(found).not.toBeNull();
    expect(found?.title).toBe('Findable');
  });

  it('preserves optional fields when provided', async () => {
    const { addBook } = await import('@/lib/books-data');
    const bookData = {
      title: 'Full Book',
      author: 'Full Author',
      genre: 'Fantasy',
      publishedYear: 2023,
      description: 'Great fantasy.',
      isbn: '978-0000000000',
      pages: 400,
      rating: 4.9,
    };
    const result = addBook(bookData);

    expect(result.genre).toBe(bookData.genre);
    expect(result.publishedYear).toBe(bookData.publishedYear);
    expect(result.pages).toBe(bookData.pages);
    expect(result.rating).toBe(bookData.rating);
  });

  it('assigned IDs are always positive integers', async () => {
    const { addBook } = await import('@/lib/books-data');
    const book = addBook({ title: 'ID Check', author: 'Author' });
    expect(book.id).toBeGreaterThan(0);
    expect(Number.isInteger(book.id)).toBe(true);
  });
});