import { Types } from 'mongoose';
import { BookReadingStatus } from 'src/common/userListItemStatus';
import { BookListItemDto } from 'src/listItems/books/definitions/bookListItem.dto';
import { BookListItemDocument } from 'src/listItems/books/definitions/bookListItem.schema';
import { UserListItemDto } from 'src/userListItems/definitions/userListItem.dto';
import { UserListDto } from 'src/userLists/definitions/userList.dto';
import { UserListDocument } from 'src/userLists/definitions/userList.schema';
import { BookUserListItemDocument } from './bookUserListItem.schema';

export class BULIDto extends UserListItemDto {
  constructor(
    public bookListItem:
      | Types.ObjectId
      | BookListItemDocument
      | BookListItemDto,
    public status: BookReadingStatus,
    public owned: boolean,
    baseProperties: UserListItemDto,
  ) {
    super();
    this.id = baseProperties.id;
    this.userList = baseProperties.userList;
    this.userId = baseProperties.userId;
    this.notes = baseProperties.notes;
    this.createdAt = baseProperties.createdAt;
    this.updatedAt = baseProperties.updatedAt;
  }

  static assign(doc: BookUserListItemDocument): BULIDto {
    return new BULIDto(doc.bookListItem, doc.status, doc.owned, {
      id: doc._id,
      userList: doc.userList,
      userId: doc.userId,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
  static assignWithPopulatedDocuments(doc: BookUserListItemDocument): BULIDto {
    return new BULIDto(
      BookListItemDto.assign(<BookListItemDocument>doc.bookListItem),
      doc.status,
      doc.owned,
      {
        id: doc._id,
        userList: UserListDto.assign(<UserListDocument>doc.userList),
        userId: doc.userId,
        notes: doc.notes,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    );
  }
}

export class CreateBULIDto {
  constructor(
    public userList: Types.ObjectId | string,
    public userId: string,
    public bookListItem: Types.ObjectId | string,
    public status: BookReadingStatus,
    public owned: boolean,
    public notes?: string,
  ) {}
}

export class PatchBULIDto {
  public notes: string;
  public status: BookReadingStatus;
  public owned: boolean;
  constructor({ notes = undefined, status = undefined, owned = undefined }) {
    this.notes = notes;
    this.status = status;
    this.owned = owned;
  }
}
