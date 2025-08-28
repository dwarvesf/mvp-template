import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logPermissionCheck(
    userId: string,
    orgId: string,
    permission: string,
    granted: boolean,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        orgId,
        action: 'permission_check',
        details: {
          permission,
          granted,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logRoleChange(
    userId: string,
    targetUserId: string,
    orgId: string,
    oldRole: string,
    newRole: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        orgId,
        action: 'role_change',
        details: {
          targetUserId,
          oldRole,
          newRole,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logOrganizationAction(
    userId: string,
    orgId: string,
    action: string,
    details: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        orgId,
        action,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logMemberAction(
    userId: string,
    orgId: string,
    action: string,
    targetUserId: string,
    details: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        orgId,
        action: `member_${action}`,
        details: {
          targetUserId,
          ...details,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logInvitationAction(
    userId: string,
    orgId: string,
    action: string,
    invitationId: string,
    details: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        orgId,
        action: `invitation_${action}`,
        details: {
          invitationId,
          ...details,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async getAuditLogs(
    orgId: string,
    options?: {
      userId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { orgId };

    if (options?.userId) {
      where.userId = options.userId;
    }

    if (options?.action) {
      where.action = options.action;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit: options?.limit || 50,
      offset: options?.offset || 0,
    };
  }
}