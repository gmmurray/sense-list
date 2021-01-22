export class AuthzUser {
  constructor(
    public roles: Record<string, any>,
    public iss: string,
    public sub: string,
    public aud: string[],
    public iat: number,
    public exp: number,
    public azp: string,
    public scope: string,
    public permissions: string[],
  ) {}
}

export interface AuthRequest {
  user: AuthzUser;
}
