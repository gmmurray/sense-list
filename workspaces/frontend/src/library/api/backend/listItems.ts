import { Auth0ContextInterface } from '@auth0/auth0-react';
import { UpdateListItemOrdinalsDto } from 'src/library/entities/listItem/ListItem';
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

export const updateListItemOrdinals = async (
  authContext: Auth0ContextInterface,
  data: UpdateListItemOrdinalsDto,
): Promise<void> => {
  return await authenticatedRequest({
    authContext,
    method: 'POST',
    url: `${route}/updateOrdinals`,
    data,
  });
};

export const deleteBookListItem = async (
  authContext: Auth0ContextInterface,
  listItemId: string,
): Promise<void> => {
  return await authenticatedRequest({
    authContext,
    method: 'DELETE',
    url: `${route}/${listItemId}`,
  });
};

export type newListItemRequest = {
  list: string;
  volumeId: string;
  ordinal: number;
};
