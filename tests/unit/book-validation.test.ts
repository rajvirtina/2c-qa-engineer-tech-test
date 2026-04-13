import { describe, expect, it } from 'vitest';

function isValidBook(book: unknown): boolean {
  if (typeof book !== 'object' || book === null) {
    return false;
  }

  const candidate = book as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.author === 'string' &&
    candidate.author.trim().length > 0
  );
}

function isValidRating(rating: unknown): boolean {
  if (typeof rating !== 'number') {
    return false;
  }

  return rating >= 0 && rating <= 5;
}

function isValidPublishedYear(year: unknown): boolean {
  if (typeof year !== 'number') {
    return false;
  }

  return year >= 1000 && year <= new Date().getFullYear();
}

function isValidIsbn(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');
  return cleaned.length === 10 || cleaned.length === 13;
}

describe('Book shape validation', () => {
  it('accepts a valid minimal book', () => {
    const book = { id: 1, title: 'Valid Title', author: 'Valid Author' };
    expect(isValidBook(book)).toBe(true);
  });

  it('accepts a full book object', () => {
    const book = {
      id: 2,
      title: 'Full Book',
      author: 'Full Author',
      genre: 'Fiction',
      publishedYear: 2022,
      description: 'A desc.',
      isbn: '978-0743273565',
      pages: 200,
      rating: 4,
    };
    expect(isValidBook(book)).toBe(true);
  });

  it('rejects a book with no title', () => {
    expect(isValidBook({ id: 1, author: 'Author' })).toBe(false);
  });

  it('rejects a book with an empty title', () => {
    expect(isValidBook({ id: 1, title: '', author: 'Author' })).toBe(false);
  });

  it('rejects a book with a whitespace-only title', () => {
    expect(isValidBook({ id: 1, title: '   ', author: 'Author' })).toBe(false);
  });

  it('rejects a book with no author', () => {
    expect(isValidBook({ id: 1, title: 'Title' })).toBe(false);
  });

  it('rejects a book with an empty author', () => {
    expect(isValidBook({ id: 1, title: 'Title', author: '' })).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidBook(null)).toBe(false);
  });

  it('rejects a non-object', () => {
    expect(isValidBook('string')).toBe(false);
  });
});

describe('Rating validation', () => {
  it('accepts 0 as a valid rating', () => {
    expect(isValidRating(0)).toBe(true);
  });

  it('accepts 5 as a valid rating', () => {
    expect(isValidRating(5)).toBe(true);
  });

  it('accepts 4.2 as a valid rating', () => {
    expect(isValidRating(4.2)).toBe(true);
  });

  it('rejects a rating above 5', () => {
    expect(isValidRating(5.1)).toBe(false);
  });

  it('rejects a negative rating', () => {
    expect(isValidRating(-1)).toBe(false);
  });

  it('rejects a string rating', () => {
    expect(isValidRating('4.5')).toBe(false);
  });
});

describe('Published year validation', () => {
  it('accepts a recent year', () => {
    expect(isValidPublishedYear(2024)).toBe(true);
  });

  it('accepts a classic year like 1925', () => {
    expect(isValidPublishedYear(1925)).toBe(true);
  });

  it('rejects a year far in the future', () => {
    expect(isValidPublishedYear(9999)).toBe(false);
  });

  it('rejects a year before 1000', () => {
    expect(isValidPublishedYear(999)).toBe(false);
  });

  it('rejects a string year', () => {
    expect(isValidPublishedYear('2024')).toBe(false);
  });
});

describe('ISBN validation', () => {
  it('accepts a valid ISBN-13 with hyphens', () => {
    expect(isValidIsbn('978-0743273565')).toBe(true);
  });

  it('accepts a valid ISBN-13 without hyphens', () => {
    expect(isValidIsbn('9780743273565')).toBe(true);
  });

  it('accepts a valid ISBN-10', () => {
    expect(isValidIsbn('0743273567')).toBe(true);
  });

  it('rejects a string that is too short', () => {
    expect(isValidIsbn('12345')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidIsbn('')).toBe(false);
  });
});