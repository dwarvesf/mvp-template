import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Organization } from '@prisma/client';

@Injectable()
export class PermissionService {
  private permissionCache = new Map<string, { permissions: string[]; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private prisma: PrismaService) {}

  async getUserPermissions(userId: string, orgId: string): Promise<string[]> {
    // Check cache first
    const cacheKey = `${userId}:${orgId}`;
    const cached = this.permissionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.permissions;
    }

    // Get user's role in the organization
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId: orgId,
          userId: userId,
        },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              where: { granted: true },
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!membership) {
      return [];
    }

    // Collect role permissions
    const rolePermissions = membership.role.rolePermissions
      .map(rp => rp.permission.name);

    // Check for user-specific permission overrides
    const userOverrides = await this.prisma.userPermission.findMany({
      where: {
        userId: userId,
        orgId: orgId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: { permission: true },
    });

    // Merge permissions (user overrides take precedence)
    const allPermissions = new Set(rolePermissions);
    
    userOverrides.forEach(up => {
      if (up.granted) {
        allPermissions.add(up.permission.name);
      } else {
        allPermissions.delete(up.permission.name);
      }
    });

    const permissions = Array.from(allPermissions);

    // Update cache
    this.permissionCache.set(cacheKey, {
      permissions,
      timestamp: Date.now(),
    });

    return permissions;
  }

  async hasPermission(
    userId: string,
    orgId: string,
    permission: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, orgId);
    return this.checkPermission(permission, permissions);
  }

  private checkPermission(required: string, userPerms: string[]): boolean {
    if (userPerms.includes('*')) return true;
    if (userPerms.includes(required)) return true;
    
    const resource = required.split('.')[0];
    return userPerms.includes(`${resource}.*`);
  }

  async getUserDefaultOrg(userId: string): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: {
        ownerId: userId,
        isDefault: true,
      },
    });
  }

  async getUserOrganizations(userId: string) {
    return this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
        role: true,
      },
    });
  }

  async clearUserPermissionCache(userId: string, orgId?: string) {
    if (orgId) {
      this.permissionCache.delete(`${userId}:${orgId}`);
    } else {
      // Clear all org permissions for user
      for (const key of this.permissionCache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.permissionCache.delete(key);
        }
      }
    }
  }

  async grantPermissionToUser(
    userId: string,
    orgId: string,
    permissionName: string,
    expiresAt?: Date,
  ) {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) {
      throw new Error(`Permission ${permissionName} not found`);
    }

    await this.prisma.userPermission.upsert({
      where: {
        orgId_userId_permissionId: {
          orgId,
          userId,
          permissionId: permission.id,
        },
      },
      create: {
        orgId,
        userId,
        permissionId: permission.id,
        granted: true,
        expiresAt: expiresAt || null,
      },
      update: {
        granted: true,
        expiresAt: expiresAt || null,
      },
    });

    // Clear cache for user
    this.clearUserPermissionCache(userId, orgId);
  }

  async revokePermissionFromUser(
    userId: string,
    orgId: string,
    permissionName: string,
  ) {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) {
      throw new Error(`Permission ${permissionName} not found`);
    }

    await this.prisma.userPermission.upsert({
      where: {
        orgId_userId_permissionId: {
          orgId,
          userId,
          permissionId: permission.id,
        },
      },
      create: {
        orgId,
        userId,
        permissionId: permission.id,
        granted: false,
      },
      update: {
        granted: false,
      },
    });

    // Clear cache for user
    this.clearUserPermissionCache(userId, orgId);
  }
}