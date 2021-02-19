import { BookReadingStatus } from 'src/library/types/BookReadingStatus';
import { BookUserList } from '../userList/BookUserList';
import { ULI } from './UserListItem';

export class BULI extends ULI {
  constructor(
    public id: string,
    public userList: string | BookUserList,
    public userId: string,
    public notes: string,
    public createdAt: Date,
    public updatedAt: Date,
    public bookListItem: string,
    public status: BookReadingStatus,
    public owned: boolean,
  ) {
    super(id, userList, userId, notes, createdAt, updatedAt);
  }
}
