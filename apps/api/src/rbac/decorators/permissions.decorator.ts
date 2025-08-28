import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRole = (role: string) =>
  SetMetadata('role', role);

// Combined decorators for common patterns
export const OrgOwnerOnly = () => RequirePermissions('org.transfer');

export const OrgAdminAccess = () => 
  RequirePermissions('org.update', 'members.invite');

export const MemberAccess = () => RequirePermissions('org.read');