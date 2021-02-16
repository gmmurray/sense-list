import { Auth0ContextInterface } from '@auth0/auth0-react';
import { BookUserList } from 'src/library/entities/userList/bookUserList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { authenticatedRequest } from '.';

export const userListsRoute = `${process.env.REACT_APP_BACKEND_URL}/user-lists`;

export const getHomePageUserLists = async (
  authContext: Auth0ContextInterface,
): Promise<DataTotalResponse<BookUserList>> => {
  return await authenticatedRequest({
    authContext,
    method: 'GET',
    url: userListsRoute,
  });
};
