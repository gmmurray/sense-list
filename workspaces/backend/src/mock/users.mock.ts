type User = {
  sub: string;
};

export const mockUser: User = { sub: process.env.MOCK_USER_ID };
