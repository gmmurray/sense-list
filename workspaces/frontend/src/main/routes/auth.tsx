import { RouteComponentProps } from 'react-router-dom';
import { RenderWithLocationType, RouteTree } from 'src/library/types/routes';
import { StaticContext } from 'react-router';
import Login from 'src/pages/auth/Login';
import Logout from 'src/pages/auth/Logout';

const routePrefix = '/auth';

const authRoutes: RouteTree = {
  login: {
    name: 'Auth',
    path: `/login`,
    render: ({
      location,
    }: RouteComponentProps<
      any,
      StaticContext,
      RenderWithLocationType | any
    >) => <Login from={location?.state?.from ?? null} />,
    isPrivate: false,
    exact: true,
    breadcrumbs: [],
  },
  logout: {
    name: 'Auth',
    path: `/logout`,
    render: () => <Logout />,
    isPrivate: false,
    exact: true,
    breadcrumbs: [],
  },
};

export default authRoutes;
