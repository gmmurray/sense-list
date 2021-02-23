import { RouteBreadcrumb, RouteTree } from 'src/library/types/routes';
import Home from 'src/pages/home';

const homePrefix = '/home';

const indexBreadcrumbs: RouteBreadcrumb[] = [
  { name: 'Home', root: true, to: homePrefix },
];

const homeRoutes: RouteTree = {
  index: {
    name: 'Home',
    path: homePrefix,
    render: props => <Home {...props} />,
    isPrivate: true,
    exact: true,
    breadcrumbs: indexBreadcrumbs,
  },
};

export default homeRoutes;
