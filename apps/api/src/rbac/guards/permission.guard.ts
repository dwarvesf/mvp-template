import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../services/permission.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedRequest } from '../../types/request.types';

interface PermissionRequest extends AuthenticatedRequest {
  orgContext?: { orgId: string };
  userPermissions?: string[];
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest<PermissionRequest>();
    const user = request.user;
    
    if (!user) {
      return false; // No user authenticated
    }

    // Get orgId from headers or request params
    const orgId = request.headers['x-org-id'] || 
                  request.params.orgId || 
                  request.body?.orgId;

    if (!orgId) {
      // If no org specified, check user's default org
      const defaultOrg = await this.permissionService.getUserDefaultOrg(user.id);
      if (!defaultOrg) {
        return false;
      }
      request.orgContext = { orgId: defaultOrg.id };
    } else {
      request.orgContext = { orgId };
    }

    // Get user permissions for the organization
    const userPermissions = await this.permissionService.getUserPermissions(
      user.id,
      request.orgContext.orgId,
    );

    // Store permissions in request for later use
    request.userPermissions = userPermissions;

    // Check if user has all required permissions
    return this.checkPermissions(requiredPermissions, userPermissions);
  }

  private checkPermissions(
    required: string[],
    userPerms: string[],
  ): boolean {
    return required.every(perm => {
      // Check for super admin wildcard
      if (userPerms.includes('*')) return true;

      // Check exact match
      if (userPerms.includes(perm)) return true;

      // Check resource wildcard (e.g., 'org.*' matches 'org.read')
      const resource = perm.split('.')[0];
      if (userPerms.includes(`${resource}.*`)) return true;

      return false;
    });
  }
}