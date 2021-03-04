import React, { useCallback, useEffect, useState } from 'react';
import { Fragment } from 'react';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Menu, Segment } from 'semantic-ui-react';
import ListsPlaceholder from 'src/library/components/lists/ListsPlaceholder';
import SegmentPlaceholder from 'src/library/components/shared/SegmentPlaceholder';
import { BookUserList } from 'src/library/entities/userList/BookUserList';
import { appRoutes } from 'src/main/routes';
import UserListCard from './UserListCard';

type AllUserListsProps = {
  loading: boolean;
  data: BookUserList[];
  onSearch: (searchTerm: string) => void;
  emptyResults: boolean;
};

const AllUserLists: FC<AllUserListsProps> = ({
  loading,
  data,
  onSearch,
  emptyResults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [setSearchTerm],
  );

  useEffect(() => onSearch(searchTerm), [searchTerm, onSearch]);

  if (loading) {
    return (
      <Segment loading>
        <ListsPlaceholder />
      </Segment>
    );
  } else if (emptyResults) {
    return (
      <SegmentPlaceholder
        text="You haven't started any lists yet"
        iconName="times circle"
        linkTo={appRoutes.progress.start.path}
        linkText="Start now"
      />
    );
  }

  return (
    <Fragment>
      <Menu borderless attached="top">
        <Menu.Item>
          <Button
            icon="plus"
            content="New list"
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
            disabled={loading}
            action
          >
            <input />
            <Button disabled={!searchTerm} onClick={() => setSearchTerm('')}>
              Reset
            </Button>
          </Input>
        </Menu.Item>
      </Menu>
      {data.length === 0 ? (
        <SegmentPlaceholder
          text="No results to show"
          iconName="search"
          hideButton={true}
          attached={true}
        />
      ) : (
        <Segment attached>
          {data.map(ul => (
            <UserListCard key={`${ul.id}-user-list-card`} userList={ul} />
          ))}
        </Segment>
      )}
    </Fragment>
  );
};

export default AllUserLists;
