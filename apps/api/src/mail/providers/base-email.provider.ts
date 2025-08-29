import { Logger } from '@nestjs/common';
import {
  IEmailProvider,
  EmailMessage,
  EmailResponse,
  BulkEmailResponse,
  EmailTemplate,
  EmailTemplateData,
  EmailProviderConfig,
} from '../interfaces/email-provider.interface';

export abstract class BaseEmailProvider implements IEmailProvider {
  protected readonly logger: Logger;
  protected readonly config: EmailProviderConfig;
  
  abstract name: string;

  constructor(config: EmailProviderConfig) {
    this.config = config;
    this.logger = new Logger(this.constructor.name);
  }

  abstract sendEmail(message: EmailMessage): Promise<EmailResponse>;

  async sendBulk(messages: EmailMessage[]): Promise<BulkEmailResponse> {
    const results = await Promise.allSettled(
      messages.map(message => this.sendEmail(message))
    );

    const successful: EmailResponse[] = [];
    const failed: EmailResponse[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push({
          id: `failed-${Date.now()}-${index}`,
          status: 'failed',
          provider: this.name,
          error: result.reason?.message || 'Unknown error',
          timestamp: new Date(),
        });
      }
    });

    return {
      successful,
      failed,
      totalSent: successful.length,
      totalFailed: failed.length,
    };
  }

  async sendTemplate<T extends EmailTemplate>(
    to: string | string[],
    template: T,
    data: EmailTemplateData[T],
  ): Promise<EmailResponse> {
    const { html, text, subject } = await this.renderTemplate(template, data);
    
    const message: EmailMessage = {
      to,
      from: this.config.from,
      subject,
      html,
      text,
    };
    
    if (this.config.replyTo) {
      message.replyTo = this.config.replyTo;
    }
    
    return this.sendEmail(message);
  }

  async verifyConfig(): Promise<boolean> {
    try {
      this.logger.log(`Verifying ${this.name} provider configuration...`);
      
      if (!this.config.from) {
        throw new Error('Missing required configuration: from email');
      }

      const isValid = await this.verifyProviderConfig();
      
      if (isValid) {
        this.logger.log(`${this.name} provider configuration verified successfully`);
      }
      
      return isValid;
    } catch (error) {
      this.logger.error(`Failed to verify ${this.name} provider configuration:`, error);
      return false;
    }
  }

  async getStatus?(_messageId: string): Promise<EmailResponse> {
    throw new Error(`Status checking not implemented for ${this.name} provider`);
  }

  protected abstract verifyProviderConfig(): Promise<boolean>;

  protected async renderTemplate<T extends EmailTemplate>(
    template: T,
    data: EmailTemplateData[T],
  ): Promise<{ html: string; text: string; subject: string }> {
    // This will be replaced with actual template rendering
    // For now, return simple templates
    
    let html = '';
    let text = '';
    let subject = '';

    switch (template) {
      case EmailTemplate.PASSWORD_RESET: {
        const resetData = data as EmailTemplateData[EmailTemplate.PASSWORD_RESET];
        subject = 'Reset Your Password';
        html = `
          <h2>Password Reset Request</h2>
          <p>Hi ${resetData.userName},</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p><a href="${resetData.resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>This link will expire in ${resetData.expiresIn}.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `;
        text = `Password Reset Request\n\nHi ${resetData.userName},\n\nReset your password: ${resetData.resetUrl}\n\nThis link expires in ${resetData.expiresIn}.`;
        break;
      }

      case EmailTemplate.MEMBER_INVITATION: {
        const inviteData = data as EmailTemplateData[EmailTemplate.MEMBER_INVITATION];
        subject = `You're invited to join ${inviteData.organizationName}`;
        html = `
          <h2>Team Invitation</h2>
          <p>Hi there,</p>
          <p>${inviteData.inviterName} has invited you to join <strong>${inviteData.organizationName}</strong> as a ${inviteData.role}.</p>
          <p><a href="${inviteData.inviteUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a></p>
          <p>This invitation will expire in 7 days.</p>
        `;
        text = `Team Invitation\n\n${inviteData.inviterName} invited you to join ${inviteData.organizationName} as a ${inviteData.role}.\n\nAccept: ${inviteData.inviteUrl}`;
        break;
      }

      case EmailTemplate.EMAIL_VERIFICATION: {
        const verifyData = data as EmailTemplateData[EmailTemplate.EMAIL_VERIFICATION];
        subject = 'Verify Your Email Address';
        html = `
          <h2>Email Verification</h2>
          <p>Hi ${verifyData.userName},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verifyData.verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
        `;
        text = `Email Verification\n\nHi ${verifyData.userName},\n\nVerify your email: ${verifyData.verificationUrl}`;
        break;
      }

      case EmailTemplate.WELCOME: {
        const welcomeData = data as EmailTemplateData[EmailTemplate.WELCOME];
        subject = 'Welcome to MVP Template!';
        html = `
          <h2>Welcome!</h2>
          <p>Hi ${welcomeData.userName},</p>
          <p>Welcome to MVP Template! We're excited to have you on board.</p>
          <p><a href="${welcomeData.loginUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a></p>
        `;
        text = `Welcome!\n\nHi ${welcomeData.userName},\n\nWelcome to MVP Template!\n\nGet started: ${welcomeData.loginUrl}`;
        break;
      }
    }

    return { html, text, subject };
  }

  protected normalizeEmail(email: string | string[]): string[] {
    return Array.isArray(email) ? email : [email];
  }

  protected createErrorResponse(error: unknown): EmailResponse {
    return {
      id: `error-${Date.now()}`,
      status: 'failed',
      provider: this.name,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date(),
    };
  }
}