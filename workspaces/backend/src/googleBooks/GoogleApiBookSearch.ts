import { GoogleApiBook } from './GoogleApiBook';

export enum GoogleApiBookSearchWithin {
  author = 'author',
  title = 'title',
  none = 'none',
}

export class GoogleApiBookSearchOptions {
  constructor(
    public searchString: string,
    public startIndex?: number,
    public maxResults?: number,
    public orderBy?: 'relevance' | 'newest',
    public searchWithin?: GoogleApiBookSearchWithin,
  ) {}
}

export class GoogleApiBookSearchResponse {
  constructor(
    public kind: string,
    public totalItems: number,
    public items: GoogleApiBook[],
  ) {}
}
