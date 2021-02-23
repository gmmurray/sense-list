import { RouteBreadcrumb, RouteTree } from 'src/library/types/routes';
import NewList from 'src/pages/lists/new/NewList';
import ViewList from 'src/pages/lists/view/ViewList';
import homeRoutes from './home';
import progressRoutes from './progress';

const routePrefix = '/lists';

const listsBreadcrumbs: RouteBreadcrumb[] = [
  ...homeRoutes.index.breadcrumbs!,
  {
    name: 'Lists',
    to: progressRoutes.start.path,
  },
];

const newBreadcrumbs: RouteBreadcrumb[] = [
  ...listsBreadcrumbs,
  {
    name: 'New',
  },
];
const viewBreadcrumbs: RouteBreadcrumb[] = [
  ...listsBreadcrumbs,
  {
    name: 'View',
  },
];

const listsRoutes: RouteTree = {
  new: {
    name: 'New',
    path: `${routePrefix}/new`,
    render: props => <NewList {...props} />,
    isPrivate: true,
    exact: true,
    breadcrumbs: newBreadcrumbs,
  },
  view: {
    name: 'View',
    path: `${routePrefix}/view/:listId`,
    render: props => <ViewList {...props} />,
    isPrivate: true,
    exact: true,
    getDynamicPath: listId => `${routePrefix}/view/${listId}`,
    breadcrumbs: viewBreadcrumbs,
  },
};

export default listsRoutes;
