import { RouteTree } from 'src/library/types/routes';
import StartList from 'src/pages/progress/StartList';

const routePrefix = '/progress';

const progressRoutes: RouteTree = {
  start: {
    path: `${routePrefix}/start`,
    render: props => <StartList {...props} />,
    isPrivate: true,
    exact: true,
  },
};

export default progressRoutes;
