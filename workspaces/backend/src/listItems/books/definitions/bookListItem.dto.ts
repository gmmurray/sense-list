import { Types } from 'mongoose';

import { ListItemDto } from 'src/listItems/definitions/listItem.dto';
import { BookListItemDocument } from './bookListItem.schema';
import { BookListItemMeta } from './bookListItem';
import { ListType } from 'src/common/listType';

export class BookListItemDto extends ListItemDto {
  constructor(
    public isbn: string,
    public meta: BookListItemMeta,
    baseProperties: ListItemDto,
  ) {
    super();
    this.id = baseProperties.id;
    this.list = baseProperties.list;
    this.listType = baseProperties.listType;
    this.ordinal = baseProperties.ordinal;
    this.createdAt = baseProperties.createdAt;
    this.updatedAt = baseProperties.updatedAt;
  }

  static create(doc: BookListItemDocument): BookListItemDto {
    return new BookListItemDto(
      doc.isbn,
      { ...doc.meta },
      {
        id: doc._id,
        list: doc.list,
        listType: doc.listType,
        ordinal: doc.ordinal,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    );
  }
}

export class QueryBookListItemDto {
  public ordinal?: number;
  public listType?: ListType;
  public title?: string;
  public description?: string;
  public author?: string;
  constructor({
    ordinal = undefined,
    listType = undefined,
    title = undefined,
    description = undefined,
    author = undefined,
  }) {
    this.ordinal = ordinal;
    this.listType = listType;
    this.title = title;
    this.description = description;
    this.author = author;
  }
}

export class CreateBookListItemDto {
  constructor(
    public list: Types.ObjectId,
    public isbn: string,
    public ordinal: number,
  ) {}
}

export class PatchBookListItemDto {
  public ordinal?: number;
  constructor({ ordinal = undefined }) {
    this.ordinal = ordinal;
  }
}
