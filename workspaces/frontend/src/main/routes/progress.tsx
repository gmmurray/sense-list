import { RouteBreadcrumb, RouteTree } from 'src/library/types/routes';
import StartList from 'src/pages/progress/start/StartList';
import ViewUserList from 'src/pages/progress/view/ViewUserList';
import ProgressList from 'src/pages/progress/list/ProgressList';
import homeRoutes from './home';

const routePrefix = '/progress';

const listBreadcrumbs: RouteBreadcrumb[] = [
  ...homeRoutes.index.breadcrumbs!,
  {
    name: 'Progress',
    to: routePrefix,
  },
];

const startBreadcrumbs: RouteBreadcrumb[] = [
  ...listBreadcrumbs,
  {
    name: 'Start',
  },
];

const viewBreadcrumbs: RouteBreadcrumb[] = [
  ...listBreadcrumbs,
  {
    name: 'View',
  },
];

const progressRoutes: RouteTree = {
  list: {
    name: 'Progress',
    path: routePrefix,
    render: props => <ProgressList {...props} />,
    isPrivate: true,
    exact: true,
    breadcrumbs: listBreadcrumbs,
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
