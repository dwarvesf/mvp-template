import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailProvider, EmailProviderConfig } from '../interfaces/email-provider.interface';
import { ResendProvider } from './resend.provider';
import { MockProvider } from './mock.provider';
import { SendGridProvider } from './sendgrid.provider';

@Injectable()
export class EmailProviderFactory {
  private readonly logger = new Logger(EmailProviderFactory.name);
  private provider: IEmailProvider;

  constructor(private configService: ConfigService) {}

  async createProvider(): Promise<IEmailProvider> {
    if (this.provider) {
      return this.provider;
    }

    const providerType = this.configService.get<string>('EMAIL_PROVIDER', 'mock').toLowerCase();
    
    const apiKey = this.configService.get<string>(`${providerType.toUpperCase()}_API_KEY`) || 
                   this.configService.get<string>('RESEND_API_KEY');
    const replyTo = this.configService.get<string>('EMAIL_REPLY_TO');
    
    const config: EmailProviderConfig = {
      provider: providerType as 'mock' | 'resend' | 'sendgrid',
      from: this.configService.get<string>('EMAIL_FROM', 'noreply@example.com'),
      sandbox: this.configService.get<boolean>('EMAIL_SANDBOX', false),
    };
    
    if (apiKey) {
      config.apiKey = apiKey;
    }
    
    if (replyTo) {
      config.replyTo = replyTo;
    }

    this.logger.log(`Creating email provider: ${providerType}`);

    switch (providerType) {
      case 'resend':
        this.provider = new ResendProvider(config);
        break;
      
      case 'sendgrid':
        this.provider = new SendGridProvider(config);
        break;
      
      case 'mock':
      case 'test':
        this.provider = new MockProvider(config);
        break;
      
      default:
        this.logger.warn(`Unknown email provider: ${providerType}, falling back to mock provider`);
        this.provider = new MockProvider(config);
    }

    // Verify provider configuration
    const isValid = await this.provider.verifyConfig();
    if (!isValid) {
      this.logger.error(`Failed to verify ${this.provider.name} provider configuration`);
      
      // Fallback to mock provider if verification fails in development
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('Falling back to mock email provider');
        this.provider = new MockProvider(config);
        await this.provider.verifyConfig();
      } else {
        throw new Error(`Email provider ${providerType} configuration is invalid`);
      }
    }

    this.logger.log(`Email provider ${this.provider.name} initialized successfully`);
    return this.provider;
  }

  getProvider(): IEmailProvider {
    if (!this.provider) {
      throw new Error('Email provider not initialized. Call createProvider() first.');
    }
    return this.provider;
  }

  // For testing purposes
  setProvider(provider: IEmailProvider): void {
    this.provider = provider;
  }
}