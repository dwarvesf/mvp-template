import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../rbac/services/audit.service';
import { RoleService } from '../rbac/services/role.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private roleService: RoleService,
  ) {}

  async createInvitation(
    orgId: string,
    invitedBy: string,
    email: string,
    roleId: string,
  ) {
    // Check if user already exists and is a member
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMember = await this.prisma.organizationMember.findUnique({
        where: {
          orgId_userId: {
            orgId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        throw new BadRequestException('User is already a member of this organization');
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await this.prisma.orgInvitation.findFirst({
      where: {
        orgId,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('An invitation already exists for this email');
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new BadRequestException('Invalid role');
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex');

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.orgInvitation.create({
      data: {
        orgId,
        email,
        roleId,
        token,
        invitedById: invitedBy,
        expiresAt,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        role: true,
        invitedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Log the action
    await this.auditService.logInvitationAction(
      invitedBy,
      orgId,
      'created',
      invitation.id,
      { email, role: role.name },
    );

    // In production, send email here
    // For now, return invitation with URL
    return {
      ...invitation,
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`,
    };
  }

  async getInvitations(orgId: string) {
    const invitations = await this.prisma.orgInvitation.findMany({
      where: {
        orgId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        role: true,
        invitedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations;
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.orgInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        role: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.getInvitationByToken(token);

    // Check if user is already a member
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId: invitation.orgId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('You are already a member of this organization');
    }

    // Add user to organization
    await this.prisma.organizationMember.create({
      data: {
        orgId: invitation.orgId,
        userId,
        roleId: invitation.roleId,
      },
    });

    // Mark invitation as accepted
    await this.prisma.orgInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    // Log the action
    await this.auditService.logInvitationAction(
      userId,
      invitation.orgId,
      'accepted',
      invitation.id,
      {},
    );

    return {
      success: true,
      organization: invitation.organization,
    };
  }

  async revokeInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.orgInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Cannot revoke accepted invitation');
    }

    // Delete invitation
    await this.prisma.orgInvitation.delete({
      where: { id: invitationId },
    });

    // Log the action
    await this.auditService.logInvitationAction(
      userId,
      invitation.orgId,
      'revoked',
      invitationId,
      {},
    );

    return { success: true };
  }

  async acceptInvitationDuringSignup(token: string, userId: string) {
    // Similar to acceptInvitation but called during user signup
    return this.acceptInvitation(token, userId);
  }
}