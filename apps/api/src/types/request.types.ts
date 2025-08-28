import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  verified?: boolean;
  currentOrgId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}