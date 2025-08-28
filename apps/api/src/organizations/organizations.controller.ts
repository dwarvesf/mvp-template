import {
  Controller,
  Get,
  Post,
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
import { RequirePermissions, OrgOwnerOnly } from '../rbac/decorators/permissions.decorator';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  TransferOwnershipDto,
} from './dto/organization.dto';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 403, description: 'Feature not enabled' })
  async createOrganization(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.createOrganization(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user organizations' })
  @ApiResponse({ status: 200, description: 'Returns user organizations' })
  async getUserOrganizations(@Req() req: AuthenticatedRequest) {
    return this.organizationsService.getUserOrganizations(req.user.id);
  }

  @Get(':orgId')
  @UseGuards(PermissionGuard)
  @RequirePermissions('org.read')
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, description: 'Returns organization details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganization(
    @Param('orgId') orgId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.organizationsService.getOrganization(orgId, req.user.id);
  }

  @Patch(':orgId')
  @UseGuards(PermissionGuard)
  @RequirePermissions('org.update')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateOrganization(
    @Param('orgId') orgId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.updateOrganization(orgId, req.user.id, dto);
  }

  @Delete(':orgId')
  @UseGuards(PermissionGuard)
  @RequirePermissions('org.delete')
  @ApiOperation({ summary: 'Delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete default organization' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async deleteOrganization(
    @Param('orgId') orgId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.organizationsService.deleteOrganization(orgId, req.user.id);
  }

  @Post(':orgId/transfer')
  @UseGuards(PermissionGuard)
  @OrgOwnerOnly()
  @ApiOperation({ summary: 'Transfer organization ownership' })
  @ApiResponse({ status: 200, description: 'Ownership transferred successfully' })
  @ApiResponse({ status: 403, description: 'Only owner can transfer ownership' })
  async transferOwnership(
    @Param('orgId') orgId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.organizationsService.transferOwnership(
      orgId,
      req.user.id,
      dto.newOwnerId,
    );
  }
}