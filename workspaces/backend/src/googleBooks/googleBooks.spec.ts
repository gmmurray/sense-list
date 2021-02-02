import { HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { GoogleApiBook } from './GoogleApiBook';
import {
  GoogleApiBookSearchOptions,
  GoogleApiBookSearchWithin,
} from './GoogleApiBookSearch';
import { GoogleBooksService } from './googlebooks.service';

const mock_book = {
  id: '_FjrugAACAAJ',
  etag: 'rDiQPayZPhU',
  selfLink: 'https://www.googleapis.com/books/v1/volumes/_FjrugAACAAJ',
  volumeInfo: {
    title: 'The Fellowship of the Ring',
    subtitle: 'Being the First Part of the Lord of the Rings',
    authors: ['John Ronald Reuel Tolkien'],
  },
};

const mock_isbn = '9780007488308';
const mock_search_first_id = 'CalSzQEACAAJ';

describe('Google Books Service', () => {
  let booksService: GoogleBooksService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), HttpModule],
      providers: [GoogleBooksService],
    }).compile();

    booksService = moduleRef.get<GoogleBooksService>(GoogleBooksService);
  });

  describe('get book by volume', () => {
    it('should return the correct book', async () => {
      const result = await booksService.getBookByVolumeId(mock_book.id);
      expect(result.id).toBe(mock_book.id);
    });

    it('should create an object with proper methods', async () => {
      const result = await booksService.getBookByVolumeId(mock_book.id);
      const isbn = GoogleApiBook.getIsbn(result.volumeInfo.industryIdentifiers);
      expect(isbn).toBe(mock_isbn);
    });
  });

  describe('search books', () => {
    it('should handle no options', async () => {
      const options = {
        searchString: 'lord of the rings',
      };
      const result = await booksService.searchBooks(options);
      expect(result.data).toBeTruthy();
    });
    it('should handle options', async () => {
      const options = new GoogleApiBookSearchOptions(
        'lord of the rings',
        10,
        10,
        'newest',
        GoogleApiBookSearchWithin.title,
      );
      const result = await booksService.searchBooks(options);
      expect(result.data).toBeTruthy();
    });
  });
});
