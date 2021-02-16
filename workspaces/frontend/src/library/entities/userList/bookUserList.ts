import { BookList } from '../list/bookList';
import { BULI } from '../uli/BookUserListItem';
import { UserList } from './userList';

export class BookUserList extends UserList {
  constructor(
    public id: string,
    public list: string | BookList,
    public userId: string,
    public notes: string,
    public userListItems: string[] | BULI[],
    public createdAt: Date,
    public updatedAt: Date,
  ) {
    super(id, list, userId, notes, userListItems, createdAt, updatedAt);
  }
}