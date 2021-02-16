import { Auth0ContextInterface } from '@auth0/auth0-react';
import { BookList } from 'src/library/entities/list/bookList';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { INewListInputs } from 'src/pages/lists/new/schema';
import { IEditListInputs } from 'src/pages/lists/view/schema';
import { authenticatedRequest } from '.';

export const listsRoute = `${process.env.REACT_APP_BACKEND_URL}/lists`;

export const getPrivateLists = async (
  authContext: Auth0ContextInterface,
): Promise<DataTotalResponse<BookList>> => {
  return await authenticatedRequest({
    authContext,
    method: 'GET',
    url: listsRoute,
    params: { ownerOnly: true },
  });
};

export const getList = async (
  authContext: Auth0ContextInterface,
  listId: string,
): Promise<BookList> => {
  return await authenticatedRequest({
    authContext,
    method: 'GET',
    url: `${listsRoute}/${listId}`,
  });
};

export const createList = async (
  authContext: Auth0ContextInterface,
  data: INewListInputs,
): Promise<BookList> => {
  return await authenticatedRequest({
    authContext,
    method: 'POST',
    url: listsRoute,
    data,
  });
};

export const updateList = async (
  authContext: Auth0ContextInterface,
  listId: string,
  data: IEditListInputs,
): Promise<void> => {
  return await authenticatedRequest({
    authContext,
    method: 'PATCH',
    url: `${listsRoute}/${listId}`,
    data,
  });
};
