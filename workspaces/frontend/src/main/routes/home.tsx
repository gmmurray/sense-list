import { RouteTree } from 'src/library/types/routes';
import Home from 'src/pages/home';

const homePrefix = '/home';

const homeRoutes: RouteTree = {
  index: {
    path: homePrefix,
    render: props => <Home {...props} />,
    isPrivate: true,
    exact: true,
  },
};

export default homeRoutes;
