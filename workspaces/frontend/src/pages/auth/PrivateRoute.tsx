import React from 'react';
import {
  Redirect,
  Route,
  RouteProps,
  RouteComponentProps,
} from 'react-router-dom';
import PageLayout from 'src/library/components/auth/layout/PageLayout';
import authRoutes from 'src/main/routes/auth';

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
            to={{ pathname: authRoutes.login.path, state: { from: location } }}
          />
        )}
      >
        {/* <Redirect to={{ pathname: '/login', state: { from: location } }} /> */}
      </Route>
    );
  }
};

export default PrivateRoute;
