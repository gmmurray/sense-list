import { Auth0ContextInterface } from '@auth0/auth0-react';
import { authenticatedRequest } from '.';

export const route = `${process.env.REACT_APP_BACKEND_URL}/books/list-items`;

export const createBookListItem = async (
  authContext: Auth0ContextInterface,
  data: newListItemRequest,
): Promise<void> => {
  return await authenticatedRequest({
    authContext,
    method: 'POST',
    url: route,
    data,
  });
};

export type newListItemRequest = {
  list: string;
  volumeId: string;
  ordinal: number;
};
