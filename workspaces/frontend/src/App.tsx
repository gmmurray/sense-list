import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PrivateRoute from './library/components/auth/PrivateRoute';
import { RouteDeclaration } from './library/types/routes';
import { appRoutes, privateRoutes, publicRoutes } from './main/routes';
import LoginLoader from './library/components/layout/LoginLoader';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <LoginLoader />;
  }

  return (
    <Switch>
      {publicRoutes.map(({ path, render, exact }: RouteDeclaration) => (
        <Route key={path} path={path} exact={exact} render={render} />
      ))}
      {privateRoutes.map(({ path, render, exact }: RouteDeclaration) => (
        <PrivateRoute
          key={path}
          isAuthenticated={isAuthenticated}
          path={path}
          exact={exact}
          render={render}
        />
      ))}
      <Route
        render={() => {
          if (isAuthenticated) {
            return <Redirect to={appRoutes.home.index.path} />;
          } else {
            return <Redirect to={appRoutes.auth.login.path} />;
          }
        }}
      />
    </Switch>
  );
}

export default App;
