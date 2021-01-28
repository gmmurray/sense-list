import { NotImplementedException } from '@nestjs/common';
import { Document, Types } from 'mongoose';
import { ListType } from 'src/common/listType';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { BookUserListItem } from 'src/userListItems/books/definitions/bookUserListItem.schema';
import { UserListItem } from 'src/userListItems/definitions/userListItem.schema';
import { UserListDocument } from './userList.schema';

export class UserListDto<T extends Document> {
  constructor(
    public id: Types.ObjectId,
    public list: string | Types.ObjectId | ListDocument,
    public userId: string,
    public notes: string,
    public userListItems: Types.ObjectId[] | T[],
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static assign(doc: UserListDocument) {
    if (true || (doc.bookUserListItems && doc.bookUserListItems.length)) {
      //TODO: remove "true"
      return new UserListDto(
        doc._id,
        doc.list,
        doc.userId,
        doc.notes,
        doc.bookUserListItems,
        doc.createdAt,
        doc.updatedAt,
      );
    } else {
      throw new NotImplementedException();
    }
  }
}

export class CreateUserListDto {
  constructor(
    public list: string | Types.ObjectId,
    public userId: string,
    public notes: string,
  ) {}
}

export class PatchUserListDto {
  public notes?: string;
  constructor({ notes = undefined }) {
    this.notes = notes;
  }
}
