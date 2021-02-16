export type RenderWithLocationType = {
  location: {
    state: {
      from: Record<string, unknown>;
    };
  };
};

export type RouteDeclaration = {
  path: string;
  render: (props: any) => JSX.Element;
  isPrivate: boolean;
  exact: boolean;
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
