import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RBACModule } from '../rbac/rbac.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { MembersController } from './members.controller';
import { InvitationsController, PublicInvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [PrismaModule, RBACModule],
  controllers: [
    OrganizationsController,
    MembersController,
    InvitationsController,
    PublicInvitationsController,
  ],
  providers: [OrganizationsService, InvitationsService],
  exports: [OrganizationsService, InvitationsService],
})
export class OrganizationsModule {}