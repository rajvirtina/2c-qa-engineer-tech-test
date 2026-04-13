import { NextRequest, NextResponse } from 'next/server';
import { getBooks, addBook } from '@/lib/books-data';

export async function GET() {
  // Simulate some API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return NextResponse.json(getBooks());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const author = typeof body.author === 'string' ? body.author.trim() : '';
    
    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Create new book
    const newBook = addBook({
      title,
      author,
      genre: body.genre || 'Unknown',
      publishedYear: body.publishedYear || new Date().getFullYear(),
      description: body.description || 'No description available.',
      isbn: body.isbn || 'N/A',
      pages: body.pages || 0,
      rating: body.rating || 0
    });

    // Simulate some API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json(newBook, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}
