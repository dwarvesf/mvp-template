import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { PermissionService } from './permission.service';

@Injectable()
export class RoleService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) {}

  async getSystemRoles() {
    return this.prisma.role.findMany({
      where: {
        isSystem: true,
        orgId: null,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async getOrganizationRoles(orgId: string) {
    return this.prisma.role.findMany({
      where: {
        OR: [
          { orgId: orgId },
          { orgId: null, isSystem: true },
        ],
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async createCustomRole(
    orgId: string,
    name: string,
    displayName: string,
    description: string,
    permissionNames: string[],
  ) {
    // Check if role already exists for org
    const existing = await this.prisma.role.findFirst({
      where: {
        name,
        orgId,
      },
    });

    if (existing) {
      throw new BadRequestException('Role already exists for this organization');
    }

    // Get permission IDs
    const permissions = await this.prisma.permission.findMany({
      where: {
        name: {
          in: permissionNames,
        },
      },
    });

    // Create role with permissions
    const role = await this.prisma.role.create({
      data: {
        name,
        displayName,
        description,
        isSystem: false,
        orgId,
        rolePermissions: {
          create: permissions.map(p => ({
            permissionId: p.id,
            granted: true,
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return role;
  }

  async updateRole(
    roleId: string,
    updates: {
      displayName?: string;
      description?: string;
      permissionNames?: string[];
    },
  ) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    // Update basic info
    const updateData: {
      displayName?: string;
      description?: string;
      rolePermissions?: {
        create: { permissionId: string; granted: boolean }[];
      };
    } = {};
    if (updates.displayName) updateData.displayName = updates.displayName;
    if (updates.description) updateData.description = updates.description;

    // Update permissions if provided
    if (updates.permissionNames) {
      // Delete existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Get new permission IDs
      const permissions = await this.prisma.permission.findMany({
        where: {
          name: {
            in: updates.permissionNames,
          },
        },
      });

      // Create new permission mappings
      updateData.rolePermissions = {
        create: permissions.map(p => ({
          permissionId: p.id,
          granted: true,
        })),
      };
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data: updateData,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async deleteRole(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role is in use
    const membersWithRole = await this.prisma.organizationMember.count({
      where: { roleId },
    });

    if (membersWithRole > 0) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to members',
      );
    }

    await this.prisma.role.delete({
      where: { id: roleId },
    });
  }

  async assignRoleToMember(
    orgId: string,
    userId: string,
    roleId: string,
  ) {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    // Update member's role
    await this.prisma.organizationMember.update({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
      data: {
        roleId,
      },
    });

    // Clear permission cache
    await this.permissionService.clearUserPermissionCache(userId, orgId);
  }

  async getDefaultRole(): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: {
        isDefault: true,
        isSystem: true,
      },
    });
  }

  async getRoleByName(name: string, orgId?: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: {
        name,
        orgId: orgId || null,
      },
    });
  }
}