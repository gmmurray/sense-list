import { Types } from 'mongoose';
import { StringIdType } from 'src/common/types/stringIdType';
import { BookReadingStatus } from 'src/common/types/userListItemStatus';
import { BookListItemDocument } from 'src/listItems/books/definitions/bookListItem.schema';
import { UserListDocument } from 'src/userLists/definitions/userList.schema';

export class DefaultBULI {
  constructor(
    public userList: Types.ObjectId | UserListDocument,
    public userId: string,
    public notes: string,
    public bookListItem: Types.ObjectId | BookListItemDocument,
    public status: BookReadingStatus,
    public owned: boolean,
  ) {}

  static createDefault(
    userId: string,
    userListId: StringIdType,
    bookListItemId: StringIdType,
  ): DefaultBULI {
    return new DefaultBULI(
      new Types.ObjectId(userListId),
      userId,
      '',
      new Types.ObjectId(bookListItemId),
      BookReadingStatus.notStarted,
      false,
    );
  }
}
