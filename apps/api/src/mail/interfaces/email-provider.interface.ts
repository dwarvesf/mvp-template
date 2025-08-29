export interface EmailMessage {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: string[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface EmailResponse {
  id: string;
  status: 'sent' | 'queued' | 'failed';
  provider: string;
  error?: string;
  timestamp: Date;
}

export interface BulkEmailResponse {
  successful: EmailResponse[];
  failed: EmailResponse[];
  totalSent: number;
  totalFailed: number;
}

export enum EmailTemplate {
  PASSWORD_RESET = 'password-reset',
  MEMBER_INVITATION = 'member-invitation',
  EMAIL_VERIFICATION = 'email-verification',
  WELCOME = 'welcome',
}

export interface EmailTemplateData {
  [EmailTemplate.PASSWORD_RESET]: {
    userName: string;
    resetUrl: string;
    expiresIn: string;
  };
  [EmailTemplate.MEMBER_INVITATION]: {
    inviterName: string;
    organizationName: string;
    inviteUrl: string;
    role: string;
  };
  [EmailTemplate.EMAIL_VERIFICATION]: {
    userName: string;
    verificationUrl: string;
  };
  [EmailTemplate.WELCOME]: {
    userName: string;
    loginUrl: string;
  };
}

export interface IEmailProvider {
  name: string;
  
  sendEmail(message: EmailMessage): Promise<EmailResponse>;
  
  sendBulk(messages: EmailMessage[]): Promise<BulkEmailResponse>;
  
  sendTemplate<T extends EmailTemplate>(
    to: string | string[],
    template: T,
    data: EmailTemplateData[T],
  ): Promise<EmailResponse>;
  
  verifyConfig(): Promise<boolean>;
  
  getStatus?(messageId: string): Promise<EmailResponse>;
}

export interface EmailProviderConfig {
  provider: 'resend' | 'sendgrid' | 'ses' | 'mock';
  apiKey?: string;
  from: string;
  replyTo?: string;
  sandbox?: boolean;
}