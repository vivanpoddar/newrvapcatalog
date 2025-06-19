import { getData } from '@/lib/db';

export async function GET() {
  try {
    // Test the getData function with empty filters to get all books
    const result = await getData({
      genres: [],
      languages: [],
      yearRange: null,
      searchQueries: [],
      titleSearch: '',
      idSearch: '',
      authorSearch: '',
      page: 1,
      pageSize: 5
    });

    // Check if any books have checkout details
    const booksWithCheckouts = result.data.filter(book => book.checkoutDetails);
    const availableBooks = result.data.filter(book => !book.isCheckedOut);
    const checkedOutBooks = result.data.filter(book => book.isCheckedOut);

    return Response.json({
      message: 'Checkout details test successful',
      totalBooks: result.data.length,
      availableBooks: availableBooks.length,
      checkedOutBooks: checkedOutBooks.length,
      booksWithDetails: booksWithCheckouts.length,
      sampleBooks: result.data.map(book => ({
        number: book.number,
        title: book.title,
        isCheckedOut: book.isCheckedOut,
        checkedOutByCurrentUser: book.checkedOutByCurrentUser,
        checkoutDetails: book.checkoutDetails ? {
          userDisplay: book.checkoutDetails.userDisplay,
          checkedOutDate: book.checkoutDetails.checkedOutDate
        } : null
      })),
      pagination: result.pagination
    });

  } catch (error: any) {
    return Response.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
