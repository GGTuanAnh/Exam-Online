import { Controller, Post, Body, Get, Query, UseGuards, Req, UnauthorizedException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công. Email xác thực đã được gửi.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc email đã tồn tại' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Xác thực email bằng token' })
  @ApiQuery({ name: 'token', description: 'Token xác thực từ email', required: true })
  @ApiResponse({ status: 200, description: 'Xác thực email thành công' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc đã hết hạn' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập bằng email và password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'Password123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công. Trả về access_token và refresh_token' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  async login(@Body() req) {
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return this.authService.login(user);
  }

  @Get('google')
  @ApiOperation({ summary: 'Bắt đầu OAuth2.0 với Google' })
  @ApiResponse({ status: 302, description: 'Redirect đến Google login' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback endpoint' })
  @ApiResponse({ status: 302, description: 'Redirect về frontend với token' })
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const auth = await this.authService.login(req.user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userJson = JSON.stringify(auth.user);
    const userB64Url = Buffer.from(userJson, 'utf8').toString('base64url');

    const redirectUrl =
      `${frontendUrl}/auth/callback` +
      `?access_token=${encodeURIComponent(auth.access_token)}` +
      `&refresh_token=${encodeURIComponent(auth.refresh_token)}` +
      `&user=${encodeURIComponent(userB64Url)}`;

    return res.redirect(redirectUrl);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Gia hạn access token mới bằng refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Trả về access_token mới' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc đã hết hạn' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Thiếu refresh token');
    }
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Gửi email reset password' })
  @ApiResponse({ status: 200, description: 'Email reset password đã được gửi' })
  @ApiResponse({ status: 404, description: 'Email không tồn tại' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password bằng token từ email' })
  @ApiResponse({ status: 200, description: 'Reset password thành công' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc đã hết hạn' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu (cần authenticated)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Mật khẩu cũ không đúng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }
}
