import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'EMP123', description: 'Employee code' })
  @IsNotEmpty()
  @IsString()
  employeeCode: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'OTP received in email' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Reset token received after OTP verification' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password (minimum 8 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
} 