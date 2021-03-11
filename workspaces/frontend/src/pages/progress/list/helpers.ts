import { BookList } from "src/library/entities/list/Booklist";
import { BULI } from "src/library/entities/uli/BookUserListItem";
import { BookUserList } from "src/library/entities/userList/BookUserList";
import { BookReadingStatus } from "src/library/types/BookReadingStatus";

export type filterOptions = {
    status: 'complete' | 'incomplete' | 'all';
    isPublic: 'public' | 'private' | 'all'; 
}

export const DEFAULT_FILTER_OPTIONS: filterOptions = {
  status: 'all',
  isPublic: 'all'
}

export const filterBookUserLists = (filter: filterOptions, items: BookUserList[]) => {
  let resultItems = [...items];
  if (filter.status === 'complete') {
    resultItems = resultItems.filter(item => (item.userListItems as BULI[]).every(uli => uli.status === BookReadingStatus.completed));
  } else if (filter.status === 'incomplete') {
    resultItems = resultItems.filter(item => (item.userListItems as BULI[]).every(uli => uli.status === BookReadingStatus.notStarted || uli.status === BookReadingStatus.inProgress));
  }

  if (filter.isPublic === 'public') {
    resultItems = resultItems.filter(item => (item.list as BookList).isPublic);
  } else if (filter.isPublic === 'private') {
    resultItems = resultItems.filter(item => !(item.list as BookList).isPublic);
  }

  return resultItems;
}