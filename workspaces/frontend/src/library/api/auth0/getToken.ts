import { Auth0ContextInterface } from '@auth0/auth0-react';

export const getToken = async (context: Auth0ContextInterface) => {
  return await context.getAccessTokenSilently();
};
