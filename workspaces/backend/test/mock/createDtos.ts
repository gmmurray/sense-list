import { ListType } from 'src/common/listType';
import { CreateBookListItemDto } from 'src/listItems/books/definitions/bookListItem.dto';
import { CreateListDto } from 'src/lists/definitions/list.dto';
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
