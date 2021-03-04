import { useAuth0 } from '@auth0/auth0-react';
import React, { useCallback, useEffect, useState } from 'react';
import { FC } from 'react';
import { Button, Message, Modal } from 'semantic-ui-react';
import { searchGoogleBooks } from 'src/library/api/backend/googleBooks';
import { GoogleApiBook } from 'src/library/entities/googleBooks/GoogleApiBook';
import {
  GoogleApiBookOrderBy,
  GoogleApiBookSearchOptions,
  GoogleApiBookSearchWithin,
} from 'src/library/entities/googleBooks/GoogleApiBookSearchOptions';
import {
  createBookListItem,
  newListItemRequest,
} from 'src/library/api/backend/listItems';
import SearchView from './SearchView';
import {
  DEFAULT_ERROR_STATE,
  DEFAULT_LOADING_STATE,
  DEFAULT_PAGE_STATE,
  DEFAULT_SEARCH_STATE,
  getStartIndex,
  newListItemModalErrorState,
  newListItemModalLoadingState,
  newListItemModalPageState,
  newListItemModalSearchState,
} from './helpers';
import { useAlert } from 'react-alert';
import SelectedView from './SelectedView';

type NewListItemModalProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onModalSubmitted: () => void;
  listId: string;
  newOrdinal: number;
  excludedBookIds: string[];
};

const NewListItemModal: FC<NewListItemModalProps> = ({
  open,
  onOpen,
  onClose,
  onModalSubmitted,
  listId,
  newOrdinal,
  excludedBookIds,
}) => {
  const auth = useAuth0();
  const alert = useAlert();
  const [selectedBook, setSelectedBook] = useState<GoogleApiBook | null>(null);
  const [search, setSearch] = useState<newListItemModalSearchState>(
    DEFAULT_SEARCH_STATE,
  );
  const [loading, setLoading] = useState<newListItemModalLoadingState>(
    DEFAULT_LOADING_STATE,
  );
  const [error, setError] = useState<newListItemModalErrorState>(
    DEFAULT_ERROR_STATE,
  );
  const [page, setPage] = useState<newListItemModalPageState>(
    DEFAULT_PAGE_STATE,
  );

  const handleSearchLoadingChange = useCallback(
    (searchLoading: boolean) => {
      setLoading({ ...loading, search: searchLoading });
    },
    [loading, setLoading],
  );

  const handleSaveLoadingChange = useCallback(
    (saveLoading: boolean) => {
      setLoading({ ...loading, save: saveLoading });
    },
    [loading, setLoading],
  );

  const handleSearchErrorChange = useCallback(
    (searchError: string | null) => {
      setError({ ...error, search: searchError });
    },
    [error, setError],
  );

  const handleSaveErrorChange = useCallback(
    (saveError: string | null) => {
      setError({ ...error, save: saveError });
    },
    [error, setError],
  );

  const handleSearchValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearch({ ...search, value: e.target.value }),
    [search, setSearch],
  );

  const handleItemsPerPageChange = useCallback(
    (itemsPerPage: number) => {
      setPage({ ...page, itemsPerPage });
    },
    [page, setPage],
  );

  const handleOrderByChange = useCallback(
    (orderBy: GoogleApiBookOrderBy) => {
      setSearch({
        ...search,
        options: {
          ...search.options,
          orderBy,
        },
      });
    },
    [search, setSearch],
  );

  const handleSearchWithinChange = useCallback(
    (searchWithin: GoogleApiBookSearchWithin) => {
      setSearch({
        ...search,
        options: {
          ...search.options,
          searchWithin,
        },
      });
    },
    [search, setSearch],
  );

  const handleSelectedBookChange = useCallback(
    async (book: GoogleApiBook) => {
      setSelectedBook(book);
    },
    [setSelectedBook],
  );

  const handleSearch = useCallback(
    async (newPage: number): Promise<void> => {
      handleSearchLoadingChange(true);
      setError(DEFAULT_ERROR_STATE);
      try {
        const searchOptions: GoogleApiBookSearchOptions = {
          searchString: search.value,
          startIndex: getStartIndex(newPage, page.itemsPerPage),
          maxResults: page.itemsPerPage,
          orderBy: search.options.orderBy,
          searchWithin: search.options.searchWithin,
        };
        const data = await searchGoogleBooks(auth, searchOptions);
        if (data) {
          setSearch({
            ...search,
            results: data.data,
          });
          setPage({
            ...page,
            totalPages: Math.floor(data.total / page.itemsPerPage),
            currentPage: newPage,
          });
        }
      } catch (error) {
        handleSearchErrorChange(error.message);
      } finally {
        handleSearchLoadingChange(false);
      }
    },
    [
      auth,
      handleSearchErrorChange,
      handleSearchLoadingChange,
      search,
      setSearch,
      setPage,
      page,
    ],
  );

  const handleSaveItem = useCallback(async () => {
    if (selectedBook) {
      handleSaveLoadingChange(true);
      handleSaveErrorChange(null);
      try {
        const req: newListItemRequest = {
          list: listId,
          volumeId: selectedBook.id,
          ordinal: newOrdinal,
        };
        await createBookListItem(auth, req);
        alert.success('Item successfully added');
        onClose();
        onModalSubmitted();
      } catch (error) {
        handleSaveErrorChange(error.message);
      }
    }
  }, [
    handleSaveErrorChange,
    handleSaveLoadingChange,
    auth,
    listId,
    newOrdinal,
    selectedBook,
    onModalSubmitted,
    alert,
    onClose,
  ]);

  const handleReset = useCallback(() => {
    setSearch(DEFAULT_SEARCH_STATE);
    setSelectedBook(null);
    setError(DEFAULT_ERROR_STATE);
    setLoading(DEFAULT_LOADING_STATE);
    setPage(DEFAULT_PAGE_STATE);
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedBook(null);
  }, []);

  useEffect(() => {
    handleReset();
  }, [open, handleReset]);

  const isValidBook = !!selectedBook;

  return (
    <Modal onOpen={onOpen} onClose={onClose} open={open} closeIcon>
      <div style={{ margin: '1rem 1rem 0' }}>
        <Message
          hidden={!error.search && !error.save}
          negative
          style={{ borderLeft: 'none', borderRight: 'none' }}
        >
          {error.search || error.save}
        </Message>
      </div>
      <Modal.Header>Add a book</Modal.Header>
      <Modal.Content image={!!selectedBook?.volumeInfo?.imageLinks ?? false}>
        {!selectedBook && (
          <SearchView
            currentPage={page.currentPage}
            books={search.results}
            excludedBooks={excludedBookIds}
            totalPages={page.totalPages}
            itemsPerPage={page.itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            loading={loading.search}
            searchTerm={search.value}
            onSearchTermChange={handleSearchValueChange}
            orderBy={search.options.orderBy}
            onOrderByChange={handleOrderByChange}
            searchWithin={search.options.searchWithin}
            onSearchWithinChange={handleSearchWithinChange}
            onSelect={handleSelectedBookChange}
            onReset={handleReset}
            onSubmit={handleSearch}
          />
        )}
        {selectedBook && <SelectedView selectedBook={selectedBook} />}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} content="Close" />
        {selectedBook && (
          <Button onClick={handleDeselect}>Pick another instead</Button>
        )}
        <Button
          primary
          onClick={handleSaveItem}
          disabled={!isValidBook}
          loading={loading.save && !error.save}
        >
          Add to list
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default NewListItemModal;
