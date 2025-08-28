import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { AuditService } from './services/audit.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PermissionService,
    RoleService,
    AuditService,
    // Optionally make PermissionGuard global
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionGuard,
    // },
  ],
  exports: [PermissionService, RoleService, AuditService],
})
export class RBACModule {}