import { ListType } from 'src/common/types/listType';
import { BookReadingStatus } from 'src/common/types/userListItemStatus';
import { CreateBookListItemDto } from 'src/listItems/books/definitions/bookListItem.dto';
import { CreateListDto } from 'src/lists/definitions/list.dto';
import { CreateBULIDto } from 'src/userListItems/books/definitions/buli.dto';
import { CreateUserListDto } from 'src/userLists/definitions/userList.dto';

export const createList: CreateListDto = {
  isPublic: false,
  title: 'Test List',
  description: 'testing 123',
  type: ListType.Book,
  category: 'test-list',
};

export const createBookListItem: CreateBookListItemDto = {
  list: null,
  isbn: '9781408855904',
  ordinal: 0,
};

export const createUserList: CreateUserListDto = {
  list: null,
  userId: null,
  notes: 'test user list',
};

export const createBULI: CreateBULIDto = {
  userList: null,
  userId: null,
  bookListItem: null,
  status: BookReadingStatus.inProgress,
  owned: true,
  notes: 'test item',
};
