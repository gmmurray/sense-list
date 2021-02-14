import { Auth0ContextInterface } from '@auth0/auth0-react';
import { authenticatedRequest } from '.';

export const userListsRoute = `${process.env.REACT_APP_BACKEND_URL}/user-lists`;

export const getHomePageUserLists = async (
  authContext: Auth0ContextInterface,
) => {
  return await authenticatedRequest({
    authContext,
    method: 'GET',
    url: userListsRoute,
  });
};
