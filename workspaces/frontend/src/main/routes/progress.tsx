import { Redirect } from 'react-router-dom';
import { RouteBreadcrumb, RouteTree } from 'src/library/types/routes';
import StartList from 'src/pages/progress/StartList';
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
};

export default progressRoutes;
