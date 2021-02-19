import { ListType } from 'src/library/types/ListType';
import { BookList } from '../list/bookList';
import { BookListItemMeta } from './BookListItemMeta';

export class BookListItem {
  constructor(
    public id: string,
    public list: string | BookList,
    public ordinal: number,
    public listType: ListType,
    public createdAt: Date,
    public updatedAt: Date,
    public isbn: string,
    public volumeId: string,
    public meta: BookListItemMeta,
  ) {}
}
