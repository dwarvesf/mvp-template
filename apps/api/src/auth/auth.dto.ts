import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateUserRequest,
  LoginRequest,
  VALIDATION_RULES,
  ERROR_MESSAGES,
} from '@mvp-template/shared';

export class RegisterDto implements CreateUserRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: ERROR_MESSAGES.VALIDATION_FAILED })
  email: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd',
    description: `User password (minimum ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters)`,
    minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
  })
  @IsString()
  @MinLength(VALIDATION_RULES.PASSWORD.MIN_LENGTH, {
    message: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`,
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginDto implements LoginRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: ERROR_MESSAGES.VALIDATION_FAILED })
  email: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd',
    description: 'User password',
  })
  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
