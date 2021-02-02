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

  public static getNormalizedAuthors(
    authors: OpenLibraryBookAuthor[],
  ): string[] {
    return authors.map(kvp => kvp.name);
  }
  public static getRelevantIdentifiers(
    identifiers: OpenLibraryBookIdentifier,
  ): Record<string, string> {
    const relevantIdentifiers = {};
    Object.keys(identifiers)
      .filter(key => key === 'goodreads' || key === 'amazon')
      .forEach(key => {
        relevantIdentifiers[key] = identifiers[key][0];
      });

    return relevantIdentifiers;
  }
}
