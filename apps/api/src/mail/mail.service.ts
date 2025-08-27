import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend | null;

  constructor() {
    this.resend = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;
  }

  async sendVerificationEmail(to: string, userId: string) {
    if (!this.resend) {
      console.log(
        'Email service not configured. Would send verification email to:',
        to,
      );
      return;
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify?id=${userId}`;

    await this.resend.emails.send({
      from: process.env.EMAIL_FROM || 'hello@yourdomain.com',
      to,
      subject: 'Verify your email',
      html: `
        <h1>Welcome to MVP-TEMPLATE!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    if (!this.resend) {
      console.log(
        'Email service not configured. Would send reset email to:',
        to,
      );
      return;
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: process.env.EMAIL_FROM || 'hello@yourdomain.com',
      to,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }
}
