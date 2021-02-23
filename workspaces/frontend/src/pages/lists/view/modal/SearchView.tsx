import React, { Fragment } from 'react';
import { FC } from 'react';
import { Modal, Grid, Header, Segment } from 'semantic-ui-react';
import { GoogleApiBook } from 'src/library/entities/googleBooks/GoogleApiBook';
import {
  GoogleApiBookOrderBy,
  GoogleApiBookSearchWithin,
} from 'src/library/entities/googleBooks/GoogleApiBookSearchOptions';
import SearchMenu from './SearchMenu';
import SearchResult from './SearchResult';

type SearchViewProps = {
  currentPage: number;
  books: GoogleApiBook[];
  excludedBooks: string[];
  totalPages: number;
  itemsPerPage: number;
  onItemsPerPageChange: (newValue: number) => void;
  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  orderBy: GoogleApiBookOrderBy;
  onOrderByChange: (newValue: GoogleApiBookOrderBy) => void;
  searchWithin: GoogleApiBookSearchWithin;
  onSearchWithinChange: (newValue: GoogleApiBookSearchWithin) => void;
  onSelect: (selection: GoogleApiBook) => Promise<void>;
  onReset: () => void;
  onSubmit: (page: number) => Promise<void>;
};

const SearchView: FC<SearchViewProps> = ({
  currentPage,
  books,
  excludedBooks,
  totalPages,
  itemsPerPage,
  onItemsPerPageChange,
  loading,
  searchTerm,
  onSearchTermChange,
  orderBy,
  onOrderByChange,
  searchWithin,
  onSearchWithinChange,
  onSelect,
  onReset,
  onSubmit,
}) => {
  const noAvailableBooks = books.length === 0;
  return (
    <Fragment>
      <Modal.Description>
        <Header as="h1">Search books</Header>
      </Modal.Description>
      <SearchMenu
        currentPage={currentPage}
        noAvailableBooks={noAvailableBooks}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        loading={loading}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        orderBy={orderBy}
        onOrderByChange={onOrderByChange}
        searchWithin={searchWithin}
        onSearchWithinChange={onSearchWithinChange}
        onReset={onReset}
        onSubmit={onSubmit}
      />
      <Segment
        loading={loading && books.length !== 0}
        attached
        placeholder={!loading && noAvailableBooks}
      >
        {books.length > 0 && (
          <Grid container stackable centered columns={2}>
            {books.map(result => (
              <Grid.Column key={result.id}>
                <SearchResult
                  book={result}
                  onSelect={() => onSelect(result)}
                  excluded={excludedBooks.includes(result.id)}
                />
              </Grid.Column>
            ))}
          </Grid>
        )}
      </Segment>
    </Fragment>
  );
};

export default SearchView;
