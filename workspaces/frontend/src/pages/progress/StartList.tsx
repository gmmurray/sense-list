import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';
import { Fragment } from 'react';
import { useAlert } from 'react-alert';
import {
  Container,
  Segment,
  Tab,
  TabPaneProps,
  TabProps,
} from 'semantic-ui-react';
import { SemanticShorthandItem } from 'semantic-ui-react/dist/commonjs/generic';
import { getPrivateLists } from 'src/library/api/backend/lists';
import BreadcrumbWrapper from 'src/library/components/layout/BreadcrumbWrapper';
import { defaultErrorTimeout } from 'src/library/constants/alertOptions';
import { BookList } from 'src/library/entities/list/bookList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { appRoutes } from 'src/main/routes';
import MyLists from './MyLists';

const getPublicLists = () => console.log('public');

const PublicLists = () => (
  <Tab.Pane>
    <Segment>Public lists</Segment>
  </Tab.Pane>
);

const StartList = () => {
  const auth = useAuth0();
  const alert = useAlert();
  const [activeIndex, setActiveIndex] = useState(0);
  const [myLists, setMyLists] = useState(
    new DataTotalResponse<BookList>([], 0),
  );
  const [myListsLoading, setMyListsLoading] = useState(true);

  useEffect(() => {
    const getMyLists = async () => {
      setMyListsLoading(true);
      try {
        const data = await getPrivateLists(auth);
        setMyLists(data);
      } catch (error) {
        alert.error(error.message, defaultErrorTimeout);
      } finally {
        setMyListsLoading(false);
      }
    };
    if (activeIndex === 0) {
      getMyLists();
    } else {
      setMyListsLoading(false);
      getPublicLists();
    }
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    data: TabProps,
  ) => {
    if (data.activeIndex || data.activeIndex === 0) {
      if (typeof data.activeIndex === 'number') {
        setActiveIndex(data.activeIndex);
      } else {
        setActiveIndex(parseInt(data.activeIndex));
      }
    }
  };

  const panes: {
    pane?: SemanticShorthandItem<TabPaneProps>;
    menuItem: any;
    render: () => React.ReactNode | undefined;
  }[] = [
    {
      menuItem: 'My Lists',
      render: () => <MyLists loading={myListsLoading} data={myLists} />,
    },
    {
      menuItem: 'Public Lists',
      render: () => <PublicLists />,
    },
  ];
  return (
    <Fragment>
      <Container style={{ marginBottom: '2rem' }}>
        <BreadcrumbWrapper
          breadcrumbs={appRoutes.progress.start.breadcrumbs!}
        />
      </Container>

      <Tab
        menu={{ fluid: true, vertical: true, secondary: true, pointing: true }}
        panes={panes}
        onTabChange={handleTabChange}
      />
    </Fragment>
  );
};

export default StartList;
