import { Types } from 'mongoose';

import { ListItemDomain } from 'src/listItems/definitions/listItem.domain';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListType } from 'src/common/listType';
import { OpenLibraryBook } from '../../../openLibrary/OpenLibraryBook';

export class BookListItemMeta {
  constructor(
    public authors: string[],
    public title: string,
    public subjects: string[],
    public description: string,
    public thumbnail: string,
    public publishDate: string,
    public pages: number,
    public identifiers: Record<string, string>,
  ) {}

  static create(book: OpenLibraryBook): BookListItemMeta {
    const {
      authors,
      title,
      subjects,
      description,
      publish_date: publishDate,
      identifiers,
      number_of_pages: pages,
    } = book.details;

    const { thumbnail_url: thumbnail } = book;

    const normalAuthors = authors.map(kvp => kvp.name);
    const relevantIdentifiers = {};
    Object.keys(identifiers)
      .filter(key => key === 'goodreads' || key === 'amazon')
      .forEach(key => {
        relevantIdentifiers[key] = identifiers[key][0];
      });

    return new BookListItemMeta(
      normalAuthors,
      title,
      subjects,
      description,
      thumbnail,
      publishDate,
      pages,
      relevantIdentifiers,
    );
  }
}

export class BookListItemDomain extends ListItemDomain {
  public isbn: string;
  public meta: BookListItemMeta;
  constructor(
    isbn: string,
    meta: BookListItemMeta,
    list: Types.ObjectId | ListDocument,
    ordinal: number,
  ) {
    super();
    this.listType = ListType.Book;
    this.isbn = isbn;
    this.meta = meta;
    this.list = list;
    this.ordinal = ordinal;
  }

  static create(
    list: Types.ObjectId | ListDocument,
    ordinal: number,
    book: OpenLibraryBook,
  ): BookListItemDomain {
    const meta = BookListItemMeta.create(book);
    const isbn = book.details.isbn_13 ?? book.details.isbn_10;
    return new BookListItemDomain(isbn[0], meta, list, ordinal);
  }
}
