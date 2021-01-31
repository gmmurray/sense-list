import { HttpService, Injectable } from '@nestjs/common';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import axios from 'axios';
import { OpenLibraryBook } from './OpenLibraryBook';
import {
  OpenLibrarySearchItem,
  OpenLibrarySearchOptions,
  OpenLibrarySearchResponse,
  OpenLibrarySearchResponseItem,
} from './OpenLibrarySearch';

@Injectable()
export class OpenLibraryService {
  private static base_book_retrieval_url =
    'https://openlibrary.org/api/books?format=json&jscmd=details&bibkeys=ISBN:';
  private static base_search_url = 'https://openlibrary.org/search.json?';
  constructor(private httpService: HttpService) {}

  /**
   * Gets a book by isbn from the open library API
   *
   * @param isbn
   */
  async getBookByIsbn(isbn: string): Promise<OpenLibraryBook> {
    const url = OpenLibraryService.generateRetrievalUrl(isbn);
    const book = await this.httpService.get(url).toPromise();
    return book.data[`ISBN:${isbn}`];
  }

  /**
   * Gets a list of up to 15 books via a search string
   *
   * @param searchOptions
   */
  async searchBooks(
    searchOptions: OpenLibrarySearchOptions,
  ): Promise<DataTotalResponse<OpenLibrarySearchItem>> {
    const url = OpenLibraryService.generateSearchUrl(searchOptions);

    const result = await axios.get(url);

    const items: OpenLibrarySearchResponse = result.data;

    return new DataTotalResponse(
      items.docs
        .map(
          (item: OpenLibrarySearchResponseItem) =>
            new OpenLibrarySearchItem(item),
        )
        .filter(item => item.isbn !== null),
    );
  }

  //#region private methods
  private static generateRetrievalUrl(isbn: string): string {
    return `${OpenLibraryService.base_book_retrieval_url}${isbn}`;
  }

  private static generateSearchUrl(searchOptions: OpenLibrarySearchOptions) {
    const searchStringQuery = searchOptions.searchString
      ? `&q=${encodeURIComponent(searchOptions.searchString)}`
      : '';

    const titleQuery = searchOptions.title
      ? `&title=${encodeURIComponent(searchOptions.title)}`
      : '';

    const authorQuery = searchOptions.author
      ? `&author=${encodeURIComponent(searchOptions.author)}`
      : '';

    return `${this.base_search_url}limit=15${searchStringQuery}${titleQuery}${authorQuery}`;
  }
}
