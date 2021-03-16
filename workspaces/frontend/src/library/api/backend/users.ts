import { Auth0ContextInterface } from '@auth0/auth0-react';
import { RecentActivity } from 'src/library/entities/user/RecentActivity';
import { PopulatedBookUserList } from 'src/library/entities/userList/BookUserList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { authenticatedRequest } from '.';

export const bookUsersRoute = `${process.env.REACT_APP_BACKEND_URL}/books/users`;

export const getRecentActivity = async (
  authContext: Auth0ContextInterface,
  count: number,
): Promise<DataTotalResponse<RecentActivity>> => {
  return await authenticatedRequest({
    authContext,
    method: 'GET',
    url: `${bookUsersRoute}/activity/${count}`,
  });
};

export const getActiveLists = async (
  authContext: Auth0ContextInterface,
  count: number,
): Promise<DataTotalResponse<PopulatedBookUserList>> => {
  return await authenticatedRequest({
    authContext,
    method: 'GET',
    url: `${bookUsersRoute}/active-lists/${count}`,
  });
};
