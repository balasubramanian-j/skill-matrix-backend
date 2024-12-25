import { Controller, Post, Body, UnauthorizedException, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login with employee code and password' })
  @ApiBody({
    type: LoginDto,
    description: 'User credentials',
    examples: {
      example1: {
        value: {
          employeeCode: 'EMP123',
          password: 'password123'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Login successful', schema: {
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }})
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.employeeCode,
      loginDto.password,
    );
    
    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }
    
    return this.authService.login(user);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'User email',
    examples: {
      example1: {
        value: {
          email: 'user@example.com'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully', schema: {
    example: {
      message: 'Reset code sent to your email'
    }
  }})
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get reset token' })
  @ApiBody({
    type: VerifyOtpDto,
    description: 'Email and OTP verification',
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
          otp: '123456'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully', schema: {
    example: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }})
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset token and new password',
    examples: {
      example1: {
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          newPassword: 'newPassword123'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Password reset successful', schema: {
    example: {
      message: 'Password successfully reset'
    }
  }})
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
} 