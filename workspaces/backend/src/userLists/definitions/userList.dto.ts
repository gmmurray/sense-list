import { NotImplementedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { StringIdType } from 'src/common/types/stringIdType';
import { ListDto } from 'src/lists/definitions/list.dto';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { BookUserListItemDocument } from 'src/userListItems/books/definitions/bookUserListItem.schema';
import { UserListDocument } from './userList.schema';

export class UserListDto {
  constructor(
    public id: Types.ObjectId,
    public list: StringIdType | ListDocument | ListDto,
    public userId: string,
    public notes: string,
    public userListItems: Types.ObjectId[] | BookUserListItemDocument[],
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
  static assignWithPopulatedDocuments(doc: UserListDocument) {
    if (true || (doc.bookUserListItems && doc.bookUserListItems.length)) {
      //TODO: remove "true"
      return new UserListDto(
        doc._id,
        ListDto.assign(<ListDocument>doc.list),
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
    public list: StringIdType,
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
