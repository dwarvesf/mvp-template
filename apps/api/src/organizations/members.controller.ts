import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../types/request.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { RoleService } from '../rbac/services/role.service';
import { AuditService } from '../rbac/services/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMemberRoleDto } from './dto/organization.dto';

@ApiTags('Organization Members')
@ApiBearerAuth()
@Controller('organizations/:orgId/members')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class MembersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermissions('members.read')
  @ApiOperation({ summary: 'Get organization members' })
  @ApiResponse({ status: 200, description: 'Returns organization members' })
  async getMembers(@Param('orgId') orgId: string) {
    const members = await this.prisma.organizationMember.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            verified: true,
            createdAt: true,
          },
        },
        role: true,
      },
    });

    return members.map(m => ({
      id: m.id,
      user: m.user,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  @Patch(':userId')
  @RequirePermissions('members.update')
  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Member role updated' })
  @ApiResponse({ status: 400, description: 'Cannot change owner role' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateMemberRole(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Check if trying to change owner
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (org?.ownerId === userId) {
      throw new Error('Cannot change owner role directly. Use transfer ownership instead.');
    }

    // Get old role for audit
    const oldMembership = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
      include: { role: true },
    });

    if (!oldMembership) {
      throw new Error('Member not found');
    }

    // Update role
    await this.roleService.assignRoleToMember(orgId, userId, dto.roleId);

    // Get new role for audit
    const newRole = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    // Log the change
    await this.auditService.logRoleChange(
      req.user.id,
      userId,
      orgId,
      oldMembership.role.name,
      newRole?.name || 'unknown',
    );

    return { success: true };
  }

  @Delete(':userId')
  @RequirePermissions('members.remove')
  @ApiOperation({ summary: 'Remove member from organization' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 400, description: 'Cannot remove owner' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async removeMember(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // Check if trying to remove owner
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (org?.ownerId === userId) {
      throw new Error('Cannot remove organization owner');
    }

    // Check if it's the last owner (in case of multiple owners)
    const ownerRole = await this.roleService.getRoleByName('owner');
    if (ownerRole) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: {
          orgId,
          roleId: ownerRole.id,
        },
      });

      const memberToRemove = await this.prisma.organizationMember.findUnique({
        where: {
          orgId_userId: {
            orgId,
            userId,
          },
        },
      });

      if (memberToRemove?.roleId === ownerRole.id && ownerCount === 1) {
        throw new Error('Cannot remove the last owner');
      }
    }

    // Remove member
    await this.prisma.organizationMember.delete({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    // Log the action
    await this.auditService.logMemberAction(
      req.user.id,
      orgId,
      'removed',
      userId,
      {},
    );

    return { success: true };
  }
}