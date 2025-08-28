import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { RoleService } from '../rbac/services/role.service';
import { AuditService } from '../rbac/services/audit.service';
import { PermissionService } from '../rbac/services/permission.service';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private roleService: RoleService,
    private auditService: AuditService,
    private permissionService: PermissionService,
  ) {}

  async createOrganization(userId: string, dto: CreateOrganizationDto) {
    // Check if org feature is enabled
    const orgFeature = await this.prisma.featureFlag.findUnique({
      where: { name: 'org_feature_enabled' },
    });

    if (!orgFeature?.enabled) {
      throw new ForbiddenException('Organization feature is not enabled');
    }

    // Generate slug if not provided
    const slug = dto.slug || this.generateSlug(dto.name);

    // Check if slug already exists
    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException('Organization slug already exists');
    }

    // Get owner role
    const ownerRole = await this.roleService.getRoleByName('owner');
    if (!ownerRole) {
      throw new Error('Owner role not found');
    }

    // Create organization with owner as member
    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        isDefault: false,
        ownerId: userId,
        settings: dto.settings || {},
        members: {
          create: {
            userId,
            roleId: ownerRole.id,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // Log the action
    await this.auditService.logOrganizationAction(
      userId,
      org.id,
      'organization_created',
      { name: dto.name, slug },
    );

    return org;
  }

  async getOrganization(orgId: string, userId: string) {
    // Check if user has access to org
    const hasAccess = await this.permissionService.hasPermission(
      userId,
      orgId,
      'org.read',
    );

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
            invitations: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async getUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        role: true,
      },
    });

    // Check if org feature is enabled
    const orgFeature = await this.prisma.featureFlag.findUnique({
      where: { name: 'org_feature_enabled' },
    });

    return {
      organizations: memberships.map(m => ({
        ...m.organization,
        role: m.role.name,
        roleId: m.role.id,
      })),
      featureEnabled: orgFeature?.enabled || false,
    };
  }

  async updateOrganization(orgId: string, userId: string, dto: UpdateOrganizationDto) {
    // Check permission
    const hasPermission = await this.permissionService.hasPermission(
      userId,
      orgId,
      'org.update',
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const updateData: any = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.settings !== undefined) updateData.settings = dto.settings;

    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Log the action
    await this.auditService.logOrganizationAction(
      userId,
      orgId,
      'organization_updated',
      dto,
    );

    return org;
  }

  async deleteOrganization(orgId: string, userId: string) {
    // Check permission
    const hasPermission = await this.permissionService.hasPermission(
      userId,
      orgId,
      'org.delete',
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Check if it's default org
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (org.isDefault) {
      throw new BadRequestException('Cannot delete default organization');
    }

    // Soft delete
    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log the action
    await this.auditService.logOrganizationAction(
      userId,
      orgId,
      'organization_deleted',
      {},
    );

    return { success: true };
  }

  async transferOwnership(orgId: string, userId: string, newOwnerId: string) {
    // Check permission
    const hasPermission = await this.permissionService.hasPermission(
      userId,
      orgId,
      'org.transfer',
    );

    if (!hasPermission) {
      throw new ForbiddenException('Only owner can transfer ownership');
    }

    // Check if new owner is a member
    const newOwnerMembership = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: newOwnerId,
        },
      },
    });

    if (!newOwnerMembership) {
      throw new BadRequestException('New owner must be a member of the organization');
    }

    // Get owner role
    const ownerRole = await this.roleService.getRoleByName('owner');
    if (!ownerRole) {
      throw new Error('Owner role not found');
    }

    // Update organization owner
    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        ownerId: newOwnerId,
      },
    });

    // Update roles
    await this.prisma.organizationMember.update({
      where: {
        orgId_userId: {
          orgId,
          userId: newOwnerId,
        },
      },
      data: {
        roleId: ownerRole.id,
      },
    });

    // Optionally downgrade previous owner to admin
    const adminRole = await this.roleService.getRoleByName('admin');
    if (adminRole) {
      await this.prisma.organizationMember.update({
        where: {
          orgId_userId: {
            orgId,
            userId,
          },
        },
        data: {
          roleId: adminRole.id,
        },
      });
    }

    // Log the action
    await this.auditService.logOrganizationAction(
      userId,
      orgId,
      'ownership_transferred',
      { newOwnerId },
    );

    // Clear permission caches
    await this.permissionService.clearUserPermissionCache(userId, orgId);
    await this.permissionService.clearUserPermissionCache(newOwnerId, orgId);

    return { success: true };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  async createDefaultOrganization(userId: string, userName?: string) {
    // Get owner role
    const ownerRole = await this.roleService.getRoleByName('owner');
    if (!ownerRole) {
      throw new Error('Owner role not found');
    }

    const name = `${userName || 'User'}'s Workspace`;
    const slug = `user-${userId.substring(0, 8)}-workspace`;

    const org = await this.prisma.organization.create({
      data: {
        name,
        slug,
        isDefault: true,
        ownerId: userId,
        members: {
          create: {
            userId,
            roleId: ownerRole.id,
          },
        },
      },
    });

    return org;
  }
}