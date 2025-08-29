import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProviderFactory } from './providers/email-provider.factory';
import { 
  IEmailProvider, 
  EmailTemplate, 
  EmailMessage,
  EmailResponse,
} from './interfaces/email-provider.interface';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private provider: IEmailProvider;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // Start with 1 second

  constructor(
    private readonly providerFactory: EmailProviderFactory,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.provider = await this.providerFactory.createProvider();
    this.logger.log(`Email service initialized with ${this.provider.name} provider`);
  }

  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    return this.sendWithRetry(() => this.provider.sendEmail(message));
  }

  async sendPasswordResetEmail(to: string, token: string, userName?: string): Promise<EmailResponse> {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    
    return this.sendWithRetry(() => 
      this.provider.sendTemplate(
        to,
        EmailTemplate.PASSWORD_RESET,
        {
          userName: userName || 'User',
          resetUrl,
          expiresIn: '1 hour',
        }
      )
    );
  }

  async sendInvitationEmail(
    to: string,
    inviterName: string,
    organizationName: string,
    inviteToken: string,
    role: string,
  ): Promise<EmailResponse> {
    const inviteUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/invite/${inviteToken}`;
    
    return this.sendWithRetry(() =>
      this.provider.sendTemplate(
        to,
        EmailTemplate.MEMBER_INVITATION,
        {
          inviterName,
          organizationName,
          inviteUrl,
          role,
        }
      )
    );
  }

  async sendVerificationEmail(to: string, userId: string, userName?: string): Promise<EmailResponse> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/verify?id=${userId}`;
    
    return this.sendWithRetry(() =>
      this.provider.sendTemplate(
        to,
        EmailTemplate.EMAIL_VERIFICATION,
        {
          userName: userName || 'User',
          verificationUrl,
        }
      )
    );
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<EmailResponse> {
    const loginUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/auth/signin`;
    
    return this.sendWithRetry(() =>
      this.provider.sendTemplate(
        to,
        EmailTemplate.WELCOME,
        {
          userName,
          loginUrl,
        }
      )
    );
  }

  private async sendWithRetry(
    sendFn: () => Promise<EmailResponse>,
    attempt = 1,
  ): Promise<EmailResponse> {
    try {
      return await sendFn();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        this.logger.error(`Failed to send email after ${this.maxRetries} attempts:`, error);
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
      this.logger.warn(`Email send attempt ${attempt} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.sendWithRetry(sendFn, attempt + 1);
    }
  }

  // For testing purposes
  getProvider(): IEmailProvider {
    return this.provider;
  }
}
