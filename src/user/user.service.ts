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

    // 生成 token
    const token = await this.authService.generateToken({
      id: user.id,
      phone: user.phone,
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...result } = user;
    return {
      user: result,
      ...token,
    };
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

  async checkUsernameUnique(username: string, userId?: number) {
    console.log(username, userId);
    // existingUser=true，昵称已经存在
    // 如果提供了userId，则排除该用户自己当前的昵称
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username,
        ...(userId && { NOT: { id: userId } }),
      },
    });
    return {
      isUnique: !existingUser,
    };
  }

  async updateUserInfo(userId: number, username: string, avatar?: string) {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 更新用户信息
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username,
        ...(avatar && { avatar }),
      },
    });

    const { password: _, ...result } = updatedUser;
    return result;
  }

  async logout(token) {
    await this.authService.clearToken(token);
    return {
      message: '退出登录成功',
    };
  }
}
