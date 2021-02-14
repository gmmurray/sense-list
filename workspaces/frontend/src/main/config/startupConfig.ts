enum envTypes {
  dev = 'development',
  prod = 'production',
  test = 'test',
}

type auth0Credentials = { domain: string; clientId: string; audience: string };

export const getAuth0Credentials = (): auth0Credentials => {
  switch (process.env.NODE_ENV) {
    case envTypes.dev:
      return {
        domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
        clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
        audience: process.env.REACT_APP_AUTH0_API_AUDIENCE || '',
      };
    default:
      return { domain: '', clientId: '', audience: '' };
  }
};
