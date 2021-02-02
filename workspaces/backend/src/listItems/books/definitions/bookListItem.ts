import { Types } from 'mongoose';

import { ListItemDomain } from 'src/listItems/definitions/listItem.domain';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListType } from 'src/common/types/listType';
import { OpenLibraryBook } from '../../../openLibrary/OpenLibraryBook';
import { GoogleApiBook } from 'src/googleBooks/GoogleApiBook';

export class BookListItemMeta {
  constructor(
    public title: string,
    public subtitle: string,
    public authors: string[],
    public publishedDate: string,
    public description: string,
    public pageCount: number,
    public thumbnail_url: string,
    public language: string,
    public selfLink: string,
    public identifiers?: Record<string, string>,
  ) {}

  static create(
    googleVolume: GoogleApiBook,
    openLibraryBook?: OpenLibraryBook,
  ): BookListItemMeta {
    const {
      selfLink,
      volumeInfo: {
        title,
        subtitle,
        authors,
        publishedDate,
        description,
        pageCount,
        imageLinks: { thumbnail },
        language,
      },
    } = googleVolume;

    let relevantIdentifiers = undefined;
    if (openLibraryBook?.details?.identifiers ?? false) {
      relevantIdentifiers = OpenLibraryBook.getRelevantIdentifiers(
        openLibraryBook.details.identifiers,
      );
    }

    return new BookListItemMeta(
      title,
      subtitle,
      authors,
      publishedDate,
      description,
      pageCount,
      thumbnail,
      language,
      selfLink,
      relevantIdentifiers,
    );
  }
}

export class BookListItemDomain extends ListItemDomain {
  public isbn: string;
  public volumeId: string;
  public meta: BookListItemMeta;
  constructor(
    isbn: string,
    volumeId: string,
    meta: BookListItemMeta,
    list: Types.ObjectId | ListDocument,
    ordinal: number,
  ) {
    super();
    this.listType = ListType.Book;
    this.isbn = isbn;
    this.volumeId = volumeId;
    this.meta = meta;
    this.list = list;
    this.ordinal = ordinal;
  }

  static create(
    list: Types.ObjectId | ListDocument,
    ordinal: number,
    googleVolume: GoogleApiBook,
    openLibraryBook?: OpenLibraryBook,
  ): BookListItemDomain {
    const meta = BookListItemMeta.create(googleVolume, openLibraryBook ?? null);
    const isbn = GoogleApiBook.getIsbn(
      googleVolume.volumeInfo.industryIdentifiers,
    );
    return new BookListItemDomain(isbn, googleVolume.id, meta, list, ordinal);
  }
}
