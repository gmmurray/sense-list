export class GoogleApiImageLinks {
  constructor(public smallThumbnail: string, public thumbnail: string) {}
}

export enum GoogleApiIndustryIdentifierType {
  isbn10 = 'ISBN_10',
  isbn13 = 'ISBN_13',
  issn = 'ISSN',
  other = 'OTHER',
}

export class GoogleApiIndustryIdentifier {
  constructor(
    public type: GoogleApiIndustryIdentifierType,
    public identifier: string,
  ) {}
}

export class GoogleApiBookVolumeInfo {
  constructor(
    public title: string,
    public subtitle: string,
    public authors: string[],
    public publishedDate: string,
    public description: string,
    public industryIdentifiers: GoogleApiIndustryIdentifier[],
    public pageCount: number,
    public imageLinks: GoogleApiImageLinks,
    public language: string,
  ) {}
}

export class GoogleApiBook {
  constructor(
    public id: string,
    public selfLink: string,
    public volumeInfo: GoogleApiBookVolumeInfo,
  ) {}

  public static getIsbn(
    industryIdentifiers: GoogleApiIndustryIdentifier[],
  ): string {
    let hasIsbn13 = false;
    let isbn = 'none';
    if (industryIdentifiers) {
      industryIdentifiers.forEach(identifier => {
        if (identifier.type === GoogleApiIndustryIdentifierType.isbn13) {
          hasIsbn13 = true;
          isbn = identifier.identifier;
          return;
        } else if (
          identifier.type === GoogleApiIndustryIdentifierType.isbn10 &&
          !hasIsbn13
        ) {
          isbn = identifier.identifier;
          return;
        }
      });
    }

    return isbn;
  }

  public static trimFieldsFromSearchResponse(
    responseItem: GoogleApiBook,
  ): GoogleApiBook {
    const {
      id,
      selfLink,
      volumeInfo: {
        title,
        subtitle,
        authors,
        publishedDate,
        description,
        industryIdentifiers,
        pageCount,
        imageLinks,
        language,
      },
    } = responseItem;

    return new GoogleApiBook(id, selfLink, {
      title,
      subtitle,
      authors,
      publishedDate,
      description,
      industryIdentifiers,
      pageCount,
      imageLinks,
      language,
    });
  }
}
