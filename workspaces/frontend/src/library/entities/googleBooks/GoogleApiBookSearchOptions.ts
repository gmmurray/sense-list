export enum GoogleApiBookSearchWithin {
  author = 'author',
  title = 'title',
  none = 'none',
}

export type GoogleApiBookOrderBy = 'relevance' | 'newest';

export class GoogleApiBookSearchOptions {
  constructor(
    public searchString: string,
    public startIndex?: number,
    public maxResults?: number,
    public orderBy?: GoogleApiBookOrderBy,
    public searchWithin?: GoogleApiBookSearchWithin,
  ) {}
}
