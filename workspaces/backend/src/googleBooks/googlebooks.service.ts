import {
  HttpService,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { GoogleApiBook } from './GoogleApiBook';
import {
  GoogleApiBookSearchOptions,
  GoogleApiBookSearchResponse,
  GoogleApiBookSearchWithin,
} from './GoogleApiBookSearch';

@Injectable()
export class GoogleBooksService {
  private static base_url = 'https://www.googleapis.com/books/v1/volumes';
  constructor(private httpService: HttpService) {}

  /**
   * Gets a book by its google books API volume id
   *
   * @param volumeId
   */
  async getBookByVolumeId(volumeId: string): Promise<GoogleApiBook> {
    const url = GoogleBooksService.generateRetrievalUrl(volumeId);

    const result = await this.httpService.get(url).toPromise();
    return result.data;
  }

  /**
   * Searches google books API volumes listing
   *
   * @param searchOptions
   */
  async searchBooks(
    searchOptions: GoogleApiBookSearchOptions,
  ): Promise<DataTotalResponse<GoogleApiBook>> {
    try {
      const url = GoogleBooksService.generateSearchUrl(searchOptions);

      const result = await this.httpService.get(url).toPromise();

      const data: GoogleApiBookSearchResponse = result.data;

      const items =
        data?.items?.map(item =>
          GoogleApiBook.trimFieldsFromSearchResponse(item),
        ) ?? [];
      const total = data?.totalItems ?? 0;
      return new DataTotalResponse(items, total);
    } catch (error) {
      throw new InternalServerErrorException(
        'There was an error with Google Books API',
      );
    }
  }

  //#region private methods

  private static generateRetrievalUrl(volumeId: string): string {
    return `${this.base_url}/${volumeId}?apiKey=${process.env.GOOGLE_BOOKS_API_KEY}`;
  }

  private static generateSearchUrl(
    searchOptions: GoogleApiBookSearchOptions,
  ): string {
    const {
      startIndex = 0,
      maxResults = 10,
      orderBy = 'relevance',
      searchString,
      searchWithin = GoogleApiBookSearchWithin.none,
    } = searchOptions;
    const prequery = this.getSearchWithinClause(searchWithin);
    const formattedString = searchString.replace(/\s/g, '+');
    const params = {
      startIndex,
      maxResults,
      orderBy,
      q: prequery + formattedString,
    };
    return `${this.base_url}?${this.generateQueryString(
      params,
    )}&printType=books&apiKey=${process.env.GOOGLE_BOOKS_API_KEY}`;
  }

  private static generateQueryString(
    params: Record<string, string | number>,
  ): string {
    return Object.keys(params)
      .map(key => key + '=' + params[key])
      .join('&');
  }

  private static getSearchWithinClause(
    searchWithin: GoogleApiBookSearchWithin,
  ): string {
    switch (searchWithin) {
      case GoogleApiBookSearchWithin.author:
        return 'inauthor:';
      case GoogleApiBookSearchWithin.title:
        return 'intitle:';
      default:
        return '';
    }
  }
  //#endregion
}
