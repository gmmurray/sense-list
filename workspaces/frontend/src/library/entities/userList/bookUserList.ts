import { BookList } from '../list/BookList';
import { BULI } from '../uli/BookUserListItem';
import { UserList } from './UserList';

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

export class PopulatedBookUserList extends UserList {
  constructor(
    public id: string,
    public list: BookList,
    public userId: string,
    public notes: string,
    public userListItems: BULI[],
    public createdAt: Date,
    public updatedAt: Date,
  ) {
    super(id, list, userId, notes, userListItems, createdAt, updatedAt);
  }
}
