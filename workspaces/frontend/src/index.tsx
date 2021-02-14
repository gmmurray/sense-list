import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import { Provider as AlertProvider } from 'react-alert';

import { getAuth0Credentials } from './main/config/startupConfig';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AlertTemplate from './library/components/auth/layout/AlertTemplate';
import alertOptions from './library/components/auth/layout/alertOptions';

import 'semantic-ui-css/semantic.min.css';

const auth0Credentials = getAuth0Credentials();

ReactDOM.render(
  <Auth0Provider
    domain={auth0Credentials.domain}
    clientId={auth0Credentials.clientId}
    audience={auth0Credentials.audience}
    redirectUri={window.location.origin}
    useRefreshTokens={true}
  >
    <React.StrictMode>
      <BrowserRouter>
        <AlertProvider template={AlertTemplate} {...alertOptions}>
          <App />
        </AlertProvider>
      </BrowserRouter>
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById('root'),
);

reportWebVitals();
