import {
  AppRouteTree,
  RouteDeclaration,
  RouteTree,
} from 'src/library/types/routes';
import authRoutes from './auth';
import homeRoutes from './home';
import listsRoutes from './lists';
import progressRoutes from './progress';

const flattenRouteTree = (routes: RouteTree) =>
  Object.keys(routes).map(key => ({
    path: routes[key].path,
    render: routes[key].render,
    isPrivate: routes[key].isPrivate,
    exact: routes[key].exact,
  }));

const filterToPublic = (routes: RouteDeclaration[]) =>
  routes.filter(route => !route.isPrivate);

const filterToPrivate = (routes: RouteDeclaration[]) =>
  routes.filter(route => route.isPrivate);

export const publicRoutes = [
  ...filterToPublic(flattenRouteTree(authRoutes)),
  ...filterToPublic(flattenRouteTree(homeRoutes)),
];

export const privateRoutes = [
  ...filterToPrivate(flattenRouteTree(authRoutes)),
  ...filterToPrivate(flattenRouteTree(homeRoutes)),
  ...filterToPrivate(flattenRouteTree(progressRoutes)),
  ...filterToPrivate(flattenRouteTree(listsRoutes)),
];

export const appRoutes: AppRouteTree = {
  auth: { ...authRoutes },
  home: { ...homeRoutes },
  progress: { ...progressRoutes },
  lists: { ...listsRoutes },
};
