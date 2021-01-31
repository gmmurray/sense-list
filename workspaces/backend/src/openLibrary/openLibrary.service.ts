import { HttpService, Injectable } from '@nestjs/common';

import { OpenLibraryBook } from './OpenLibraryBook';

@Injectable()
export class OpenLibraryService {
  private static base_retrieval_url =
    'https://openlibrary.org/api/books?format=json&jscmd=details&bibkeys=ISBN:';
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

  //#region private methods
  private static generateRetrievalUrl(isbn: string): string {
    return `${OpenLibraryService.base_retrieval_url}${isbn}`;
  }
}
