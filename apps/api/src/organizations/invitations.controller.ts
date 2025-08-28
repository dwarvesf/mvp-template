import {
  Controller,
  Get,
  Post,
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
import { InvitationsService } from './invitations.service';
import { InviteMemberDto } from './dto/organization.dto';

@ApiTags('Organization Invitations')
@ApiBearerAuth()
@Controller('organizations/:orgId/invitations')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @RequirePermissions('invitations.create')
  @ApiOperation({ summary: 'Create organization invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created' })
  @ApiResponse({ status: 400, description: 'User already member or invitation exists' })
  async createInvitation(
    @Param('orgId') orgId: string,
    @Body() dto: InviteMemberDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.invitationsService.createInvitation(
      orgId,
      req.user.id,
      dto.email,
      dto.roleId,
    );
  }

  @Get()
  @RequirePermissions('invitations.read')
  @ApiOperation({ summary: 'Get organization invitations' })
  @ApiResponse({ status: 200, description: 'Returns pending invitations' })
  async getInvitations(@Param('orgId') orgId: string) {
    return this.invitationsService.getInvitations(orgId);
  }

  @Delete(':invitationId')
  @RequirePermissions('invitations.revoke')
  @ApiOperation({ summary: 'Revoke invitation' })
  @ApiResponse({ status: 200, description: 'Invitation revoked' })
  @ApiResponse({ status: 400, description: 'Cannot revoke accepted invitation' })
  async revokeInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.invitationsService.revokeInvitation(invitationId, req.user.id);
  }
}

// Public endpoints for invitation acceptance
@ApiTags('Public Invitations')
@Controller('invitations')
export class PublicInvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  @ApiResponse({ status: 200, description: 'Returns invitation details' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @ApiResponse({ status: 400, description: 'Invitation expired or already accepted' })
  async getInvitation(@Param('token') token: string) {
    return this.invitationsService.getInvitationByToken(token);
  }

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  @ApiResponse({ status: 400, description: 'Already member or invitation invalid' })
  async acceptInvitation(
    @Param('token') token: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.invitationsService.acceptInvitation(token, req.user.id);
  }
}