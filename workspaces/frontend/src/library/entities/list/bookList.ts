import { ListType } from '../../types/ListType';
import { BookListItem } from '../listItem/BookListItem';
import { List, QueryListDto } from './List';

export class BookList extends List {
  constructor(
    public id: string,
    public isPublic: boolean,
    public title: string,
    public description: string,
    public type: ListType,
    public category: string,
    public ownerId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public bookListItems: string[] | BookListItem[],
  ) {
    super(
      id,
      isPublic,
      title,
      description,
      type,
      category,
      ownerId,
      createdAt,
      updatedAt,
    );
  }
}

export class QueryBookListDto extends QueryListDto {
  constructor(searchTerm: string, ownerOnly: boolean) {
    const value = searchTerm || undefined;
    super(value, value, value, ListType.Book, ownerOnly);
  }
}
