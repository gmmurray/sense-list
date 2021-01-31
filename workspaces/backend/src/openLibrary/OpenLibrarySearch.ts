const getThumbnailUrl = (id: string | number): string => {
  return `https://covers.openlibrary.org/b/id/${id}-M.jpg`;
};

export class OpenLibrarySearchResponseItem {
  constructor(
    public cover_i: number,
    public title: string,
    public edition_count: number,
    public first_publish_year: number,
    public author_name: string[],
    public isbn: string[],
    public language: string[],
  ) {}
}

export class OpenLibrarySearchResponse {
  public numFound: number;
  public start: number;
  public docs: OpenLibrarySearchResponseItem[];
}

export class OpenLibrarySearchItem {
  public thumbnail_url: string;
  public title: string;
  public edition_count: number;
  public first_publish_year: number;
  public authors: string[];
  public isbn: string;
  public language: string[];
  constructor({
    cover_i,
    title,
    edition_count,
    first_publish_year,
    author_name,
    isbn,
    language,
  }: OpenLibrarySearchResponseItem) {
    this.thumbnail_url = cover_i ? getThumbnailUrl(cover_i) : null;
    this.title = title;
    this.edition_count = edition_count;
    this.first_publish_year = first_publish_year;
    this.authors = author_name;
    this.isbn = isbn ? isbn[0] : null;
    this.language = language;
  }
}

export class OpenLibrarySearchOptions {
  constructor(
    public searchString?: string,
    public title?: string,
    public author?: string,
  ) {}
}
