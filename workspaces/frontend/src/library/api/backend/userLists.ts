import { Auth0ContextInterface } from '@auth0/auth0-react';
import {
  BookUserList,
  PopulatedBookUserList,
} from 'src/library/entities/userList/BookUserList';
import {
  CreateUserListDto,
  PatchUserListDto,
} from 'src/library/entities/userList/UserList';
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

export const getAllUserLists = async (
  authContext: Auth0ContextInterface,
): Promise<DataTotalResponse<BookUserList>> => {
  return await authenticatedRequest({
    authContext,
    method: 'GET',
    url: userListsRoute,
  });
};

export const createUserList = async (
  authContext: Auth0ContextInterface,
  data: CreateUserListDto,
): Promise<BookUserList> => {
  return await authenticatedRequest({
    authContext,
    method: 'POST',
    url: userListsRoute,
    data,
  });
};

export const updateUserList = async (
  authContext: Auth0ContextInterface,
  userListId: string,
  data: PatchUserListDto,
): Promise<void> => {
  return await authenticatedRequest({
    authContext,
    method: 'PATCH',
    url: `${userListsRoute}/${userListId}`,
    data,
  });
};

export const getFullUserList = async (
  authContext: Auth0ContextInterface,
  userListId: string,
): Promise<PopulatedBookUserList> => {
  return await authenticatedRequest({
    authContext,
    method: 'GET',
    url: `${userListsRoute}/${userListId}`,
  });
};

export const deleteUserList = async (
  authContext: Auth0ContextInterface,
  userListId: string,
): Promise<void> => {
  return await authenticatedRequest({
    authContext,
    method: 'DELETE',
    url: `${userListsRoute}/${userListId}`,
  });
};
