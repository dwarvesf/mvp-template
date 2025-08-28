import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Organization URL slug' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  @MinLength(3)
  @MaxLength(50)
  slug?: string;

  @ApiPropertyOptional({ description: 'Organization settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ description: 'Organization name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Organization settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class TransferOwnershipDto {
  @ApiProperty({ description: 'New owner user ID' })
  @IsString()
  newOwnerId: string;
}

export class InviteMemberDto {
  @ApiProperty({ description: 'Email address to invite' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Role ID to assign' })
  @IsString()
  roleId: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ description: 'New role ID' })
  @IsString()
  roleId: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Invitation token' })
  @IsString()
  token: string;
}