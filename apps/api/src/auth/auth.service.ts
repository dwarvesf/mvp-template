import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.dto';
import { MailService } from '../mail/mail.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { InvitationsService } from '../organizations/invitations.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    @Inject(forwardRef(() => OrganizationsService))
    private organizationsService: OrganizationsService,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name || null,
      },
    });

    // Create default organization for the user
    await this.organizationsService.createDefaultOrganization(user.id, user.name || undefined);

    // If invitation token provided, accept it
    if (dto.invitationToken) {
      try {
        await this.invitationsService.acceptInvitation(dto.invitationToken, user.id);
      } catch (error) {
        // Log error but don't fail registration
        console.error('Failed to accept invitation during signup:', error);
      }
    }

    await this.mailService.sendVerificationEmail(user.email, user.id);

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const { password: _password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: 'If the email exists, a reset link will be sent' };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // TODO: Send email with reset link
    // For now, log to console for development
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
    console.log('\n========================================');
    console.log('🔑 PASSWORD RESET LINK (Dev Mode)');
    console.log('========================================');
    console.log(`Email: ${user.email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`Token: ${token}`);
    console.log(`Expires: ${expiresAt.toLocaleString()}`);
    console.log('========================================\n');

    // Uncomment when email service is configured
    // await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: 'If the email exists, a reset link will be sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetToken.delete({
      where: { id: tokenRecord.id },
    });

    return { message: 'Password reset successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
