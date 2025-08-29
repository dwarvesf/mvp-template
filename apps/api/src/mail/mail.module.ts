import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { EmailProviderFactory } from './providers/email-provider.factory';

@Module({
  imports: [ConfigModule],
  providers: [MailService, EmailProviderFactory],
  exports: [MailService],
})
export class MailModule {}
