import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'balasubramanian.jeyaguru@solverminds.com',
        pass: process.env.EMAIL_PASS || 'rkgbyptvnxgsrhdq',
      },
    });
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateResetToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.officialEmail };
    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  private async sendResetEmail(user: User, otp: string): Promise<void> {
    await this.transporter.sendMail({
      to: user.officialEmail,
      subject: 'Password Reset Code',
      html: `
        <h1>Password Reset Request</h1>
        <p>Dear ${user.employeeName},</p>
        <p>We received a request to reset your password for your [Service/App Name] account. To proceed, please use the code below to verify your request:</p>
        <p>Your Password Reset Code: <strong>${otp}</strong></p>
        <p>This code is valid for the next 24 hours. After that, you will need to request a new code.</p>
        <p>If you did not request a password reset, please ignore this email. Your account will remain secure.</p>
        <p>For further assistance, feel free to reach out to us at [Support Email/Phone].</p>
        <p>Thank you,</p>
        <p>[Your Company/Service Name]</p>
      `,
    });
  }

  async validateUser(employeeCode: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ 
      where: { employeeCode, isActive: true } 
    });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      username: user.employeeCode, 
      sub: user.id, 
      role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        employeeCode: user.employeeCode,
        officialEmail: user.officialEmail,
        employeeName: user.employeeName,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ 
      where: { officialEmail: email, isActive: true } 
    });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save OTP and expiry in user record
    user.resetOtp = await bcrypt.hash(otp, 10);
    user.resetOtpExpiry = otpExpiry;
    await this.userRepository.save(user);

    // Send OTP via email
    await this.sendResetEmail(user, otp);

    return { message: 'Reset code sent to your email' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ 
      where: { officialEmail: email, isActive: true } 
    });

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      throw new UnauthorizedException('Invalid reset request');
    }

    if (new Date() > user.resetOtpExpiry) {
      throw new UnauthorizedException('Reset code has expired');
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid reset code');
    }

    const token = await this.generateResetToken(user);
    return { token };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ 
        where: { id: payload.sub, isActive: true } 
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Update password
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await this.userRepository.save(user);

      return { message: 'Password successfully reset' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
} 