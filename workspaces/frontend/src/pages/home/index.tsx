import { useAuth0 } from '@auth0/auth0-react';
import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Header,
  Icon,
  Placeholder,
  Segment,
} from 'semantic-ui-react';
import { getHomePageUserLists } from 'src/library/api/backend/userLists';
import { BookUserList } from 'src/library/entities/userList/BookUserList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { appRoutes } from 'src/main/routes';

const Home = () => {
  const auth = useAuth0();
  const alert = useAlert();
  const [activeLists, setActiveLists] = useState(
    new DataTotalResponse<BookUserList>([], 0),
  );
  const [activeListsLoading, setActiveListsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      setActiveListsLoading(true);
      try {
        const data = await getHomePageUserLists(auth);
        setActiveLists(data);
      } catch (error) {
        alert.error(error.message, { timeout: 15000 });
      } finally {
        setActiveListsLoading(false);
      }
    };
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Fragment>
      <Header as="h1">Active Lists</Header>
      {activeListsLoading && (
        <Segment loading>
          <Card raised fluid>
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
      {!activeListsLoading && activeLists.total === 0 && (
        <Segment placeholder>
          <Header icon>
            <Icon name="search" />
            No active lists found
          </Header>
          <Button primary as={Link} to={appRoutes.progress.start.path}>
            Start one
          </Button>
        </Segment>
      )}
    </Fragment>
  );
};

export default Home;
