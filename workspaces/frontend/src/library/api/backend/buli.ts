import { Auth0ContextInterface } from '@auth0/auth0-react';
import {
  BULI,
  CreateBULIDto,
  PatchBULIDto,
} from 'src/library/entities/uli/BookUserListItem';
import { authenticatedRequest } from '.';

export const buliRoute = `${process.env.REACT_APP_BACKEND_URL}/books/user-list-items`;

export const createBuli = async (
  authContext: Auth0ContextInterface,
  data: CreateBULIDto,
): Promise<BULI> => {
  return await authenticatedRequest({
    authContext,
    method: 'POST',
    url: buliRoute,
    data,
  });
};

export const updateBuli = async (
  authContext: Auth0ContextInterface,
  buliId: string,
  data: PatchBULIDto,
): Promise<void> => {
  return await authenticatedRequest({
    authContext,
    method: 'PATCH',
    url: `${buliRoute}/${buliId}`,
    data,
  });
};
