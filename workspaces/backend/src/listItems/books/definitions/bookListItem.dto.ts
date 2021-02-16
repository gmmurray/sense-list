import { Document, Types } from 'mongoose';

import { ListItemDto } from 'src/listItems/definitions/listItem.dto';
import { BookListItemDocument } from './bookListItem.schema';
import { BookListItemMeta } from './bookListItem';
import { ListType } from 'src/common/types/listType';
import { ListDto } from 'src/lists/definitions/list.dto';

export class BookListItemDto extends ListItemDto {
  constructor(
    public isbn: string,
    public volumeId: string,
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

  static assign(doc: BookListItemDocument): BookListItemDto {
    let subList: ListDto | undefined;
    if (doc.list && doc.list instanceof Document) {
      subList = ListDto.assign(doc.list);
    }
    return new BookListItemDto(
      doc.isbn,
      doc.volumeId,
      { ...doc.meta },
      {
        id: doc._id,
        list: subList || doc.list,
        listType: doc.listType,
        ordinal: doc.ordinal,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    );
  }
}

export class QueryBookListItemDto {
  public list?: string;
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
    public volumeId: string,
    public ordinal: number,
  ) {}
}

export class PatchBookListItemDto {
  public ordinal?: number;
  constructor({ ordinal = undefined }) {
    this.ordinal = ordinal;
  }
}
