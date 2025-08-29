import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { BaseEmailProvider } from './base-email.provider';
import {
  EmailMessage,
  EmailResponse,
  EmailProviderConfig,
} from '../interfaces/email-provider.interface';

@Injectable()
export class ResendProvider extends BaseEmailProvider {
  name = 'Resend';
  private resend: Resend;

  constructor(config: EmailProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Resend API key is required');
    }

    this.resend = new Resend(config.apiKey);
  }

  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    try {
      // For Resend test accounts, override 'to' email to verified address
      const toEmail =
        process.env.NODE_ENV === 'production' 
          ? message.to 
          : process.env.RESEND_TEST_EMAIL || 'hieuvd@d.foundation';

      const emailData: any = {
        from: message.from || this.config.from,
        to: toEmail,
        subject: message.subject,
        html: message.html || '',
        text: message.text || '',
      };

      // Add optional fields
      if (message.replyTo || this.config.replyTo) {
        emailData.replyTo = message.replyTo || this.config.replyTo;
      }

      if (message.headers) {
        emailData.headers = message.headers;
      }

      if (message.tags) {
        emailData.tags = message.tags.map((tag) => ({ name: tag, value: tag }));
      }

      if (message.attachments) {
        emailData.attachments = message.attachments.map((att) => ({
          filename: att.filename,
          content:
            typeof att.content === 'string'
              ? Buffer.from(att.content).toString('base64')
              : att.content.toString('base64'),
          type: att.contentType,
        }));
      }

      const response = await this.resend.emails.send(emailData as any);

      if (response.error) {
        this.logger.error('Resend API error:', response.error);
        throw new Error(
          `Resend API error: ${response.error.message || JSON.stringify(response.error)}`,
        );
      }

      return {
        id: response.data?.id || `resend-${Date.now()}`,
        status: 'sent',
        provider: this.name,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to send email via Resend:', errorMessage);
      return this.createErrorResponse(error);
    }
  }

  override async getStatus(messageId: string): Promise<EmailResponse> {
    try {
      // Resend doesn't provide a status endpoint in their SDK yet
      // This is a placeholder for when they add it
      this.logger.warn(`Status checking not available for Resend provider`);

      return {
        id: messageId,
        status: 'sent',
        provider: this.name,
        timestamp: new Date(),
      };
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  protected async verifyProviderConfig(): Promise<boolean> {
    try {
      // Try to send a test email to verify configuration
      // Resend doesn't have a specific verify endpoint
      // We could potentially do a dry run or check domain verification

      if (!this.config.apiKey) {
        throw new Error('API key not configured');
      }

      // Check if API key format is valid (starts with re_)
      if (!this.config.apiKey.startsWith('re_')) {
        throw new Error('Invalid Resend API key format');
      }

      return true;
    } catch (error) {
      this.logger.error('Resend configuration verification failed:', error);
      return false;
    }
  }
}
