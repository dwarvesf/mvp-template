import { Injectable } from '@nestjs/common';
import { BaseEmailProvider } from './base-email.provider';
import {
  EmailMessage,
  EmailResponse,
  EmailProviderConfig,
} from '../interfaces/email-provider.interface';

@Injectable()
export class MockProvider extends BaseEmailProvider {
  name = 'Mock';
  private sentEmails: EmailResponse[] = [];

  constructor(config: EmailProviderConfig) {
    super(config);
  }

  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    const emailId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Log email to console for development
    this.logger.log('\n========================================');
    this.logger.log('📧 MOCK EMAIL PROVIDER - Email Sent');
    this.logger.log('========================================');
    this.logger.log(`ID: ${emailId}`);
    this.logger.log(`From: ${message.from || this.config.from}`);
    this.logger.log(`To: ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
    this.logger.log(`Reply-To: ${message.replyTo || this.config.replyTo || 'Not set'}`);
    this.logger.log(`Subject: ${message.subject}`);
    
    if (message.text) {
      this.logger.log('\n--- Plain Text Content ---');
      this.logger.log(message.text);
    }
    
    if (message.html) {
      this.logger.log('\n--- HTML Content Preview ---');
      // Strip HTML tags for console preview
      const textPreview = message.html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200);
      this.logger.log(textPreview + (textPreview.length >= 200 ? '...' : ''));
    }
    
    if (message.attachments && message.attachments.length > 0) {
      this.logger.log(`\nAttachments: ${message.attachments.map(a => a.filename).join(', ')}`);
    }
    
    if (message.tags && message.tags.length > 0) {
      this.logger.log(`Tags: ${message.tags.join(', ')}`);
    }
    
    this.logger.log('========================================\n');

    const response: EmailResponse = {
      id: emailId,
      status: 'sent',
      provider: this.name,
      timestamp: new Date(),
    };

    // Store for testing purposes
    this.sentEmails.push(response);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return response;
  }

  override async getStatus(messageId: string): Promise<EmailResponse> {
    const email = this.sentEmails.find(e => e.id === messageId);
    
    if (!email) {
      return {
        id: messageId,
        status: 'failed',
        provider: this.name,
        error: 'Email not found',
        timestamp: new Date(),
      };
    }

    return email;
  }

  protected async verifyProviderConfig(): Promise<boolean> {
    this.logger.log('Mock provider is always ready!');
    return true;
  }

  // Test helper methods
  getSentEmails(): EmailResponse[] {
    return this.sentEmails;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }

  getLastSentEmail(): EmailResponse | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }
}