import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async register(
    phone: string,
    password: string,
    username: string,
    avatar: string,
  ) {
    // 检查手机号是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('手机号已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = await this.prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        username,
        avatar,
      },
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...result } = user;
    return result;
  }

  async login(phone: string, password: string) {
    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 生成 token
    const token = await this.authService.generateToken({
      id: user.id,
      phone: user.phone,
    });

    // 返回用户信息和 token
    const { password: _, ...result } = user;
    return {
      user: result,
      ...token,
    };
  }

  async getUserInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async logout(userId: number, token: string) {
    // 验证token
    const payload = await this.authService.verifyToken(token);

    if (!payload) {
      throw new UnauthorizedException('token无效');
    }

    // 清除token
    await this.authService.clearToken(token);
    return {
      code: 200,
      message: '退出登录成功',
    };
  }
}
