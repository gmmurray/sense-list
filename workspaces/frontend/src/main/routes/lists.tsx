import { RouteTree } from 'src/library/types/routes';
import NewList from 'src/pages/lists/new/NewList';
import ViewList from 'src/pages/lists/view/ViewList';

const routePrefix = '/lists';

const listsRoutes: RouteTree = {
  new: {
    path: `${routePrefix}/new`,
    render: props => <NewList {...props} />,
    isPrivate: true,
    exact: true,
  },
  view: {
    path: `${routePrefix}/view/:listId`,
    render: props => <ViewList {...props} />,
    isPrivate: true,
    exact: true,
    getDynamicPath: listId => `${routePrefix}/view/${listId}`,
  },
};

export default listsRoutes;
