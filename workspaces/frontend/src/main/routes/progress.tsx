import { Redirect } from 'react-router-dom';
import { RouteBreadcrumb, RouteTree } from 'src/library/types/routes';
import StartList from 'src/pages/progress/start/StartList';
import ViewUserList from 'src/pages/progress/view/ViewUserList';
import homeRoutes from './home';

const routePrefix = '/progress';

const name = 'Progress';

const progressBreadcrumbs: RouteBreadcrumb[] = [
  ...homeRoutes.index.breadcrumbs!,
  {
    name,
    to: routePrefix,
  },
];

const startBreadcrumbs: RouteBreadcrumb[] = [
  ...progressBreadcrumbs,
  {
    name: 'Start',
  },
];

const viewBreadcrumbs: RouteBreadcrumb[] = [
  ...progressBreadcrumbs,
  {
    name: 'View',
  },
];

const progressRoutes: RouteTree = {
  progress: {
    name: 'Progress',
    path: routePrefix,
    render: () => <Redirect to={`${routePrefix}/start`} />,
    isPrivate: true,
    exact: true,
    breadcrumbs: progressBreadcrumbs,
  },
  start: {
    name: 'Start',
    path: `${routePrefix}/start`,
    render: props => <StartList {...props} />,
    isPrivate: true,
    exact: true,
    breadcrumbs: startBreadcrumbs,
  },
  view: {
    name: 'View',
    path: `${routePrefix}/view/:userListId`,
    render: props => <ViewUserList {...props} />,
    isPrivate: true,
    exact: true,
    getDynamicPath: userListId => `${routePrefix}/view/${userListId}`,
    breadcrumbs: viewBreadcrumbs,
  },
};

export default progressRoutes;
