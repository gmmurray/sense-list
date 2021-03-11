import { BookList } from 'src/library/entities/list/BookList';
import { BULI } from 'src/library/entities/uli/BookUserListItem';
import { BookUserList } from 'src/library/entities/userList/BookUserList';
import { BookReadingStatus } from 'src/library/types/BookReadingStatus';

export type filterOptions = {
  status: 'complete' | 'incomplete' | 'all';
  listOwner: 'user' | 'public' | 'all';
};

export const DEFAULT_FILTER_OPTIONS: filterOptions = {
  status: 'all',
  listOwner: 'all',
};

export const filterBookUserLists = (
  filter: filterOptions,
  items: BookUserList[],
  userId?: string,
) => {
  let resultItems = [...items];
  if (filter.status === 'complete') {
    resultItems = resultItems.filter(item =>
      (item.userListItems as BULI[]).every(
        uli => uli.status === BookReadingStatus.completed,
      ),
    );
  } else if (filter.status === 'incomplete') {
    resultItems = resultItems.filter(item =>
      (item.userListItems as BULI[]).every(
        uli =>
          uli.status === BookReadingStatus.notStarted ||
          uli.status === BookReadingStatus.inProgress,
      ),
    );
  }

  if (filter.listOwner === 'user') {
    resultItems = resultItems.filter(
      item => (item.list as BookList).ownerId === userId,
    );
  } else if (filter.listOwner === 'public') {
    resultItems = resultItems.filter(
      item => (item.list as BookList).ownerId !== userId,
    );
  }

  return resultItems;
};
