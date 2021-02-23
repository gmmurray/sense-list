export type RenderWithLocationType = {
  location: {
    state: {
      from: Record<string, unknown>;
    };
  };
};

export type RouteBreadcrumb = {
  name: string;
  to?: string;
  root?: boolean;
};

export type RouteDeclaration = {
  name: string;
  path: string;
  render: (props: any) => JSX.Element;
  isPrivate: boolean;
  exact: boolean;
  breadcrumbs?: RouteBreadcrumb[];
  getDynamicPath?: (...args: string[]) => string;
};

export type RouteTree = {
  [key: string]: RouteDeclaration;
};

export type AppRouteTree = {
  [key: string]: {
    [key: string]: RouteDeclaration;
  };
};
