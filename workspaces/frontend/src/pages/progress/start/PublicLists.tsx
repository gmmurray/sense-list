import React, { useCallback, useState } from 'react';
import { Fragment } from 'react';
import { FC } from 'react';
import { Button, Input, Menu, Segment, Tab } from 'semantic-ui-react';
import ListsPlaceholder from 'src/library/components/lists/ListsPlaceholder';
import SegmentPlaceholder from 'src/library/components/shared/SegmentPlaceholder';
import { BookList } from 'src/library/entities/list/BookList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import ListCard from './ListCard';

type PublicListsProps = {
  loading: boolean;
  data: DataTotalResponse<BookList>;
  onSubmit: (searchTerm: string) => Promise<void>;
};

const PublicLists: FC<PublicListsProps> = ({ loading, data, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [setSearchTerm],
  );

  const handleSubmit = useCallback(() => onSubmit(searchTerm), [
    onSubmit,
    searchTerm,
  ]);
  const handleReset = useCallback(() => onSubmit(''), [onSubmit]);
  const showEmptyResult = !loading && data.total === 0;
  const showResult = !showEmptyResult && data.total > 0;

  return (
    <Fragment>
      <Menu borderless attached="top">
        <Menu.Item>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={loading}
            action
          >
            <input />
            <Button
              onClick={handleSubmit}
              loading={loading}
              content="Search"
              compact
            />
            <Button
              onClick={handleReset}
              disabled={loading}
              content="Reset"
              compact
            />
          </Input>
        </Menu.Item>
      </Menu>
      <Tab.Pane as={Segment}>
        {loading && <ListsPlaceholder />}
        {showEmptyResult && (
          <SegmentPlaceholder
            text="No results to show"
            iconName="search"
            hideButton={true}
          />
        )}
        {showResult && (
          <Fragment>
            {data.data.map(list => (
              <ListCard key={list.id} list={{ ...list }} />
            ))}
          </Fragment>
        )}
      </Tab.Pane>
    </Fragment>
  );
};

export default PublicLists;
