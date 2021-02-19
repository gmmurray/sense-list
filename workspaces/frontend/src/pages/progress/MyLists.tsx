import React, { useCallback, useState } from 'react';
import { Fragment } from 'react';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Header,
  Icon,
  Input,
  Menu,
  Placeholder,
  Segment,
  Tab,
} from 'semantic-ui-react';
import { BookList } from 'src/library/entities/list/bookList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { appRoutes } from 'src/main/routes';
import ListCard from './ListCard';

type MyListsProps = {
  loading: boolean;
  data: DataTotalResponse<BookList>;
};

const MyLists: FC<MyListsProps> = ({ loading, data }) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [setSearchTerm],
  );

  const showEmptyResult = !loading && data.total === 0;
  const showResult = !loading && data.total > 0;
  const visibleLists =
    searchTerm && searchTerm !== ''
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
  return (
    <Tab.Pane>
      {loading && (
        <Segment loading>
          <Card fluid raised>
            <Card.Content>
              <Placeholder fluid>
                <Placeholder.Header image>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Header>
                <Placeholder.Paragraph>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Paragraph>
              </Placeholder>
            </Card.Content>
          </Card>
          <Card fluid>
            <Card.Content>
              <Placeholder fluid>
                <Placeholder.Header image>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Header>
                <Placeholder.Paragraph>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Paragraph>
              </Placeholder>
            </Card.Content>
          </Card>
          <Card fluid>
            <Card.Content>
              <Placeholder fluid>
                <Placeholder.Header image>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Header>
                <Placeholder.Paragraph>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Paragraph>
              </Placeholder>
            </Card.Content>
          </Card>
          <Card fluid>
            <Card.Content>
              <Placeholder fluid>
                <Placeholder.Header image>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Header>
                <Placeholder.Paragraph>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Paragraph>
              </Placeholder>
            </Card.Content>
          </Card>
          <Card fluid>
            <Card.Content>
              <Placeholder fluid>
                <Placeholder.Header image>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Header>
                <Placeholder.Paragraph>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Paragraph>
              </Placeholder>
            </Card.Content>
          </Card>
        </Segment>
      )}
      {showEmptyResult && (
        <Segment placeholder>
          <Header icon>
            <Icon name="times circle" />
            You don't have any lists yet.
          </Header>
          <Button primary as={Link} to={appRoutes.lists.new.path}>
            Create one
          </Button>
        </Segment>
      )}
      {showResult && (
        <Fragment>
          <Menu>
            <Menu.Item as={Link} to={appRoutes.lists.new.path}>
              New
            </Menu.Item>
            <Menu.Menu position="right">
              <Menu.Item>
                <Input
                  icon="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          {visibleLists.map(list => (
            <ListCard key={list.id} list={{ ...list }} />
          ))}
        </Fragment>
      )}
    </Tab.Pane>
  );
};
export default MyLists;
