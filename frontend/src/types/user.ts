// Type definitions based on Prisma Schema and Backend DTOs

export type Role = 'USER' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  avatar?: string;
  provider: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserSearchResponse = {
  found: boolean;
  message?: string;
  user?: User;
};
