import React, { useCallback, useState } from 'react';
import { Fragment } from 'react';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Menu, Segment, Tab } from 'semantic-ui-react';
import { BookList } from 'src/library/entities/list/BookList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { appRoutes } from 'src/main/routes';
import ListCard from './ListCard';
import ListsPlaceholder from '../../library/components/lists/ListsPlaceholder';
import SegmentPlaceholder from 'src/library/components/shared/SegmentPlaceholder';

type MyListsProps = {
  loading: boolean;
  data: DataTotalResponse<BookList>;
};

const MyLists: FC<MyListsProps> = ({ loading, data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [setSearchTerm],
  );

  const visibleLists = searchTerm
    ? data.data.filter(
        list =>
          list.title
            .toLocaleLowerCase()
            .includes(searchTerm.toLocaleLowerCase()) ||
          list.description
            .toLocaleLowerCase()
            .includes(searchTerm.toLocaleLowerCase()) ||
          list.category
            .toLocaleLowerCase()
            .includes(searchTerm.toLocaleLowerCase()),
      )
    : data.data;

  const showEmptyResult = !loading && data.total === 0;
  const showResult = !showEmptyResult && data.total > 0;
  const usePlaceholder = showEmptyResult || visibleLists.length === 0;
  return (
    <Fragment>
      <Menu borderless attached="top">
        <Menu.Item>
          <Button
            icon="plus"
            content="New"
            as={Link}
            to={appRoutes.lists.new.path}
            compact
          />
        </Menu.Item>
        <Menu.Item position="right">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            disabled={loading || (data.data && data.data.length === 0)}
            action
          >
            <input />
            <Button disabled={!searchTerm} onClick={() => setSearchTerm('')}>
              Reset
            </Button>
          </Input>
        </Menu.Item>
      </Menu>
      <Tab.Pane as={Segment} placeholder={usePlaceholder}>
        {loading && <ListsPlaceholder />}
        {showEmptyResult && (
          <SegmentPlaceholder
            text="You don't have any lists yet"
            iconName="times circle"
            linkTo={appRoutes.lists.new.path}
            linkText="Create one"
          />
        )}
        {showResult && (
          <Fragment>
            {usePlaceholder ? (
              <SegmentPlaceholder
                text="No results to show"
                iconName="search"
                hideButton={true}
              />
            ) : (
              visibleLists.map(list => (
                <ListCard key={list.id} list={{ ...list }} />
              ))
            )}
          </Fragment>
        )}
      </Tab.Pane>
    </Fragment>
  );
};
export default MyLists;
