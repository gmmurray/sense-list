import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Redirect, Route, Switch } from 'react-router-dom';
import authRoutes from './main/routes/auth';
import PrivateRoute from './pages/auth/PrivateRoute';
import { RouteDeclaration } from './library/types/routes';
import { privateRoutes, publicRoutes } from './main/routes';
import homeRoutes from './main/routes/home';
import LoginLoader from './library/components/auth/layout/LoginLoader';

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
            return <Redirect to={homeRoutes.index.path} />;
          } else {
            return <Redirect to={authRoutes.login.path} />;
          }
        }}
      />
    </Switch>
  );
}

export default App;
