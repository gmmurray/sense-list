import React from 'react';
import { FC } from 'react';
import { Button, Dropdown, Icon, Input, Menu } from 'semantic-ui-react';
import {
  GoogleApiBookOrderBy,
  GoogleApiBookSearchWithin,
} from 'src/library/entities/googleBooks/GoogleApiBookSearchOptions';
import { DEFAULT_PAGE_STATE } from './helpers';

type SearchMenuProps = {
  currentPage: number;
  noAvailableBooks: boolean;
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
  onReset: () => void;
  onSubmit: (page: number) => Promise<void>;
};

const SearchMenu: FC<SearchMenuProps> = ({
  currentPage,
  noAvailableBooks,
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
  onReset,
  onSubmit,
}) => {
  const smallItemsPerPage = DEFAULT_PAGE_STATE.itemsPerPage;
  const medItemsPerPage = smallItemsPerPage * 2;
  const largeItemsPerPage = smallItemsPerPage * 3;
  return (
    <Menu stackable attached="top">
      <Menu.Item>
        <Button.Group>
          <Button
            icon
            onClick={() => onSubmit(currentPage - 1)}
            disabled={currentPage === 1 || noAvailableBooks}
          >
            <Icon name="long arrow alternate left" />
          </Button>
          <Button
            icon
            onClick={() => onSubmit(currentPage + 1)}
            disabled={currentPage === totalPages - 1 || noAvailableBooks}
          >
            <Icon name="long arrow alternate right" />
          </Button>
        </Button.Group>
      </Menu.Item>
      <Menu.Item>
        <Dropdown text="Search options">
          <Dropdown.Menu>
            <Dropdown.Header>Order by</Dropdown.Header>
            <Dropdown.Item
              selected={orderBy === 'relevance'}
              onClick={() => onOrderByChange('relevance')}
            >
              Relevance
            </Dropdown.Item>
            <Dropdown.Item
              selected={orderBy === 'newest'}
              onClick={() => onOrderByChange('newest')}
            >
              Newest
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Search within</Dropdown.Header>
            <Dropdown.Item
              selected={searchWithin === GoogleApiBookSearchWithin.title}
              onClick={() =>
                onSearchWithinChange(GoogleApiBookSearchWithin.title)
              }
            >
              Title
            </Dropdown.Item>
            <Dropdown.Item
              selected={searchWithin === GoogleApiBookSearchWithin.author}
              onClick={() =>
                onSearchWithinChange(GoogleApiBookSearchWithin.author)
              }
            >
              Author
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Item>
      <Menu.Item>
        <Dropdown text="Items per page">
          <Dropdown.Menu>
            <Dropdown.Item
              selected={itemsPerPage === smallItemsPerPage}
              onClick={() => onItemsPerPageChange(smallItemsPerPage)}
            >
              {smallItemsPerPage}
            </Dropdown.Item>
            <Dropdown.Item
              selected={itemsPerPage === medItemsPerPage}
              onClick={() => onItemsPerPageChange(medItemsPerPage)}
            >
              {medItemsPerPage}
            </Dropdown.Item>
            <Dropdown.Item
              selected={itemsPerPage === largeItemsPerPage}
              onClick={() => onItemsPerPageChange(largeItemsPerPage)}
            >
              {largeItemsPerPage}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Item>
      <Menu.Item position="right">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={onSearchTermChange}
          action
        >
          <input />
          <Button
            onClick={() => onSubmit(1)}
            loading={loading}
            disabled={searchTerm === ''}
          >
            Search
          </Button>
          <Button onClick={onReset} disabled={noAvailableBooks || loading}>
            Reset
          </Button>
        </Input>
      </Menu.Item>
    </Menu>
  );
};

export default SearchMenu;
