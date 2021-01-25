export class OpenLibraryBookAuthor {
  constructor(public name: string, public key: string) {}
}
export class OpenLibraryBookIdentifier {
  [key: string]: string[];
}
export class OpenLibraryBookDetails {
  number_of_pages: number;
  title: string;
  subjects: string[];
  description: string;
  authors: OpenLibraryBookAuthor[];
  identifiers: OpenLibraryBookIdentifier;
  isbn_13?: string[];
  isbn_10: string[];
  publish_date: string;
}
export class OpenLibraryBook {
  constructor(
    public bib_key: string,
    public thumbnail_url: string,
    public details: OpenLibraryBookDetails,
  ) {}
}
