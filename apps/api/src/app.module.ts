import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { RBACModule } from './rbac/rbac.module';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MailModule,
    RBACModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
