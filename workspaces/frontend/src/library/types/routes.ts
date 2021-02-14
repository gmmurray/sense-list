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
};

export type RouteTree = {
  [key: string]: RouteDeclaration;
};
