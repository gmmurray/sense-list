import React, { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Segment } from 'semantic-ui-react';
import ListsPlaceholder from 'src/library/components/lists/ListsPlaceholder';
import SegmentPlaceholder from 'src/library/components/shared/SegmentPlaceholder';
import { BookUserList } from 'src/library/entities/userList/BookUserList';
import { appRoutes } from 'src/main/routes';
import UserListCard from '../progress/list/UserListCard';

type ActiveListsProps = {
  loading: boolean;
  data: BookUserList[];
};

const ActiveLists: FC<ActiveListsProps> = ({ loading, data }) => {
  if (loading) {
    return (
      <Segment loading>
        <ListsPlaceholder elements={5} />
      </Segment>
    );
  } else if (data.length === 0) {
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
      <Menu attached="top" borderless>
        <Menu.Item position="left">
          <Button
            icon="plus"
            content="Create book list"
            as={Link}
            to={appRoutes.lists.new.path}
            compact
          />
        </Menu.Item>
        <Menu.Item position="right">
          <Button
            icon="plus"
            content="Start existing list"
            as={Link}
            to={appRoutes.progress.start.path}
            compact
          />
        </Menu.Item>
      </Menu>
      <Segment attached>
        {data.map(ul => (
          <UserListCard key={`${ul.id}-active-list-card`} userList={ul} />
        ))}
      </Segment>
    </Fragment>
  );
};

export default ActiveLists;
