import { useAuth0 } from '@auth0/auth0-react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import BreadcrumbWrapper from 'src/library/components/layout/BreadcrumbWrapper';
import { BookUserList } from 'src/library/entities/userList/BookUserList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { appRoutes } from 'src/main/routes';
import * as userListsApi from 'src/library/api/backend/userLists';
import { defaultErrorTimeout } from 'src/library/constants/alertOptions';
import { syncSearch } from 'src/library/utilities/search';
import { BookList } from 'src/library/entities/list/BookList';
import AllUserLists from './AllUserLists';

const searchableFields = ['title', 'description', 'category'];

const ProgressList = () => {
  const auth = useAuth0();
  const alert = useAlert();

  const [allUserLists, setAllUserLists] = useState<
    DataTotalResponse<BookUserList>
  >(new DataTotalResponse([], 0));
  const [allUserListsLoading, setAllUserListsLoading] = useState(true);

  const [visibleUserLists, setVisibleUserLists] = useState<BookUserList[]>([]);

  const getUserLists = useCallback(async () => {
    setAllUserListsLoading(true);
    try {
      const data = await userListsApi.getAllUserLists(auth);
      setAllUserLists(data);
    } catch (error) {
      alert.error(error.message, defaultErrorTimeout);
    } finally {
      setAllUserListsLoading(false);
    }
  }, [alert, auth]);

  useEffect(() => {
    getUserLists();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setVisibleUserLists(allUserLists.data);
  }, [allUserLists]);

  const handleListSearch = useCallback(
    (searchTerm: string) => {
      const nestedLists = allUserLists.data.map(ul => ul.list as BookList);
      const result = syncSearch(searchTerm, [...searchableFields], nestedLists);
      const relatedUserLists = allUserLists.data.filter(ul =>
        result.some(list => list.id === (ul.list as BookList).id),
      );
      setVisibleUserLists(relatedUserLists);
    },
    [allUserLists.data],
  );

  return (
    <Fragment>
      <BreadcrumbWrapper
        breadcrumbs={appRoutes.progress.list.breadcrumbs!}
        onPage={true}
      />
      <AllUserLists
        data={visibleUserLists}
        loading={allUserListsLoading}
        onSearch={handleListSearch}
        emptyResults={allUserLists.total === 0}
      />
    </Fragment>
  );
};

export default ProgressList;
