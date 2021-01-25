import { HttpService, Injectable } from '@nestjs/common';

import { OpenLibraryBook } from './OpenLibraryBook';

@Injectable()
export class OpenLibraryService {
  private readonly base_retrieval_url: string;
  constructor(private httpService: HttpService) {
    this.base_retrieval_url =
      'https://openlibrary.org/api/books?format=json&jscmd=details&bibkeys=ISBN:';
  }

  async getBookByIsbn(isbn: string): Promise<OpenLibraryBook> {
    const url = this.generateRetrievalUrl(isbn);
    const book = await this.httpService.get(url).toPromise();
    return book.data[`ISBN:${isbn}`];
  }

  private generateRetrievalUrl(isbn: string): string {
    return `${this.base_retrieval_url}${isbn}`;
  }
}
