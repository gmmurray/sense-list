import { useAuth0 } from '@auth0/auth0-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Fragment } from 'react';
import { useAlert } from 'react-alert';
import { Container, Tab, TabPaneProps, TabProps } from 'semantic-ui-react';
import { SemanticShorthandItem } from 'semantic-ui-react/dist/commonjs/generic';
import * as listsApi from 'src/library/api/backend/lists';
import BreadcrumbWrapper from 'src/library/components/layout/BreadcrumbWrapper';
import { defaultErrorTimeout } from 'src/library/constants/alertOptions';
import { BookList, QueryBookListDto } from 'src/library/entities/list/Booklist';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { appRoutes } from 'src/main/routes';
import MyLists from './MyLists';
import PublicLists from './PublicLists';

const StartList = () => {
  const auth = useAuth0();
  const alert = useAlert();
  const [activeIndex, setActiveIndex] = useState(0);
  const [myLists, setMyLists] = useState(
    new DataTotalResponse<BookList>([], 0),
  );
  const [myListsLoading, setMyListsLoading] = useState(true);
  const [publicLists, setPublicLists] = useState(
    new DataTotalResponse<BookList>([], 0),
  );
  const [publicListsLoading, setPublicListsLoading] = useState(true);

  const handleTabChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, data: TabProps) => {
      if (data.activeIndex || data.activeIndex === 0) {
        if (typeof data.activeIndex === 'number') {
          setActiveIndex(data.activeIndex);
        } else {
          setActiveIndex(parseInt(data.activeIndex));
        }
      }
    },
    [setActiveIndex],
  );

  const getMyLists = useCallback(async () => {
    setMyListsLoading(true);
    try {
      const data = await listsApi.getPrivateLists(auth);
      setMyLists(data);
    } catch (error) {
      alert.error(error.message, defaultErrorTimeout);
    } finally {
      setMyListsLoading(false);
    }
  }, [setMyListsLoading, setMyLists, alert, auth]);

  const getPublicLists = useCallback(
    async (searchTerm: string) => {
      setPublicListsLoading(true);
      try {
        const query = new QueryBookListDto(searchTerm, false);
        const data = await listsApi.getPublicListsByQuery(auth, query);
        setPublicLists(data);
      } catch (error) {
        alert.error(error.message, defaultErrorTimeout);
      } finally {
        setPublicListsLoading(false);
      }
    },
    [setPublicListsLoading, auth, setPublicLists, alert],
  );

  useEffect(() => {
    if (activeIndex === 0) {
      setPublicListsLoading(false);
      getMyLists();
    } else {
      setMyListsLoading(false);
      getPublicLists('');
    }
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

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
      render: () => (
        <PublicLists
          loading={publicListsLoading}
          data={publicLists}
          onSubmit={getPublicLists}
        />
      ),
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
        menu={{
          fluid: true,
          vertical: true,
          secondary: true,
          pointing: true,
        }}
        panes={panes}
        onTabChange={handleTabChange}
      />
    </Fragment>
  );
};

export default StartList;
