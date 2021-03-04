import { BookListItem } from '../entities/listItem/BookListItem';
import { BULI } from '../entities/uli/BookUserListItem';

export type ItemMatch = {
  book: BookListItem;
  userItem: BULI | null;
};
