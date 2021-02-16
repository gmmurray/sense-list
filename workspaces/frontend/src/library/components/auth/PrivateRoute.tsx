import React from 'react';
import {
  Redirect,
  Route,
  RouteProps,
  RouteComponentProps,
} from 'react-router-dom';
import PageLayout from 'src/library/components/layout/PageLayout';
import { appRoutes } from 'src/main/routes';

type PrivateRouteType = {
  isAuthenticated: boolean;
};

const PrivateRoute: React.FC<PrivateRouteType & RouteProps> = ({
  isAuthenticated,
  path,
  component,
  render,
  ...rest
}) => {
  if (isAuthenticated) {
    return (
      <PageLayout>
        <Route
          {...rest}
          isAuthenticated={isAuthenticated}
          path={path}
          render={render}
        />
      </PageLayout>
    );
  } else {
    return (
      <Route
        {...rest}
        render={({ location }: RouteComponentProps) => (
          <Redirect
            to={{
              pathname: appRoutes.auth.login.path,
              state: { from: location },
            }}
          />
        )}
      />
    );
  }
};

export default PrivateRoute;
