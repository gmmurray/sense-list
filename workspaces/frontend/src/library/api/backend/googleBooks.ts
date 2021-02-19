import { Auth0ContextInterface } from '@auth0/auth0-react';
import { GoogleApiBook } from 'src/library/entities/googleBooks/GoogleApiBook';
import { GoogleApiBookSearchOptions } from 'src/library/entities/googleBooks/GoogleApiBookSearchOptions';
import { DataTotalResponse } from 'src/library/types/responseWrappers';
import { authenticatedRequest } from '.';

const route = `${process.env.REACT_APP_BACKEND_URL}/books/google`;

export const searchGoogleBooks = async (
  authContext: Auth0ContextInterface,
  data: GoogleApiBookSearchOptions,
): Promise<DataTotalResponse<GoogleApiBook>> => {
  return await authenticatedRequest({
    authContext,
    method: 'POST',
    url: route,
    data,
  });
};
