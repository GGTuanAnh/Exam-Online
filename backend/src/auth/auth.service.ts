// backend/src/auth/auth.service.ts
import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages.constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService
  ) { }

  private issueTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const refreshSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    const refreshExpiration = (this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '7d') as any;

    if (!refreshSecret) {
      throw new UnauthorizedException('Missing REFRESH_TOKEN_SECRET');
    }

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiration,
      }),
    };
  }

  // --- 1. Hàm Đăng ký ---
  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = uuidv4();

    // Tách fullName thành firstName và lastName
    const nameParts = registerDto.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.email.split('@')[0], // Tự động tạo username từ email
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        provider: 'local',
        isActive: false,
        verificationToken: verificationToken,
      },
    });

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to: newUser.email,
      subject: 'Xác thực đăng ký tài khoản Exam Online',
      html: `
        <h1>Chào ${newUser.firstName || newUser.username},</h1>
        <p>Cảm ơn bạn đã đăng ký. Vui lòng bấm vào link dưới đây để kích hoạt tài khoản:</p>
        <a href="${verificationLink}">Bấm vào đây để xác thực</a>
        <p>Hoặc copy link này: ${verificationLink}</p>
      `,
    });

    return {
      message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
    };
  }

  // --- 2. Hàm Xác thực Token ---
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        verificationToken: null,
      },
    });

    return {
      message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.',
    };
  }

  // --- 3. Hàm xử lý đăng nhập Google ---
  async validateUserGoogle(googleUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user) {
      return user;
    }

    // Determine role based on email domain
    const role = googleUser.email.endsWith('@edu.vn') ? 'ADMIN' : 'STUDENT';

    const newUser = await this.prisma.user.create({
      data: {
        email: googleUser.email,
        username: googleUser.email.split('@')[0],
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        avatar: googleUser.picture,
        provider: 'google',
        providerId: googleUser.providerId,
        isActive: true,
        password: null,
        role: role,
      },
    });

    return newUser;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user.isActive && user.provider === 'local') {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác thực.');
    }

    const tokens = this.issueTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    if (!refreshSecret) {
      throw new UnauthorizedException('Missing REFRESH_TOKEN_SECRET');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const userId = payload?.sub as string | undefined;
    if (!userId) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // Chỉ local user cần isActive
    if (!user.isActive && user.provider === 'local') {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt');
    }

    return {
      access_token: this.jwtService.sign({ email: user.email, sub: user.id, role: user.role }),
    };
  }

  // --- Forgot Password ---
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Không tiết lộ email có tồn tại hay không (security best practice)
      return {
        message: 'Nếu email tồn tại, bạn sẽ nhận được link reset mật khẩu.',
      };
    }

    // Chỉ local user mới có thể reset password
    if (user.provider !== 'local') {
      throw new BadRequestException(
        `Tài khoản đăng nhập bằng ${user.provider} không thể reset mật khẩu.`
      );
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: resetToken,
        // Note: Cần thêm field resetPasswordExpires vào schema nếu muốn strict expiration
      },
    });

    const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset mật khẩu - Exam Online',
      html: `
        <h1>Chào ${user.firstName || user.username},</h1>
        <p>Bạn đã yêu cầu reset mật khẩu. Vui lòng bấm vào link dưới đây:</p>
        <a href="${resetLink}">Reset mật khẩu</a>
        <p>Hoặc copy link này: ${resetLink}</p>
        <p><strong>Link này sẽ hết hạn sau 1 giờ.</strong></p>
        <p>Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    });

    return {
      message: 'Nếu email tồn tại, bạn sẽ nhận được link reset mật khẩu.',
    };
  }

  // --- Reset Password ---
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
      },
    });

    return {
      message: 'Đã reset mật khẩu thành công! Bạn có thể đăng nhập ngay.',
    };
  }

  // --- Change Password (User đã login) ---
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new BadRequestException('Không thể đổi mật khẩu cho tài khoản này.');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Đã đổi mật khẩu thành công!',
    };
  }
}
