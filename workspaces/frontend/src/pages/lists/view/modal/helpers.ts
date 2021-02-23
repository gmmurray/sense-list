import { GoogleApiBook } from 'src/library/entities/googleBooks/GoogleApiBook';
import {
  GoogleApiBookOrderBy,
  GoogleApiBookSearchWithin,
} from 'src/library/entities/googleBooks/GoogleApiBookSearchOptions';

export type newListItemModalSearchState = {
  results: GoogleApiBook[];
  value: string;
  options: {
    orderBy: GoogleApiBookOrderBy;
    searchWithin: GoogleApiBookSearchWithin;
  };
};

export type newListItemModalLoadingState = {
  search: boolean;
  save: boolean;
};

export const DEFAULT_LOADING_STATE: newListItemModalLoadingState = {
  search: false,
  save: false,
};

export type newListItemModalErrorState = {
  search: string | null;
  save: string | null;
};

export const DEFAULT_ERROR_STATE: newListItemModalErrorState = {
  search: null,
  save: null,
};

export type newListItemModalPageState = {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
};

export const DEFAULT_PAGE_STATE: newListItemModalPageState = {
  currentPage: 1,
  totalPages: 0,
  itemsPerPage: 6,
};

export const DEFAULT_SEARCH_STATE: newListItemModalSearchState = {
  results: [],
  value: '',
  options: {
    orderBy: 'relevance',
    searchWithin: GoogleApiBookSearchWithin.title,
  },
};

export const getStartIndex = (
  currentPage: number,
  itemsPerPage: number,
): number => (currentPage - 1) * itemsPerPage;
