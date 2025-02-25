import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body('phone') phone: string,
    @Body('password') password: string,
    @Body('username') username: string,
    @Body('avatar') avatar: string,
  ) {
    return this.userService.register(phone, password, username, avatar);
  }

  @Post('login')
  async login(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    return this.userService.login(phone, password);
  }

  // 退出登陆
  @UseGuards(JwtGuard)
  @Get('logout')
  async logout(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.userService.logout(token);
  }

  @UseGuards(JwtGuard)
  @Get('info')
  async getUserInfo(@Request() req) {
    return this.userService.getUserInfo(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get('check-username')
  async checkUsernameUnique(
    @Request() req,
    @Query('username') username: string,
  ) {
    return this.userService.checkUsernameUnique(username, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Put('update')
  async updateUserInfo(
    @Request() req,
    @Body('username') username: string,
    @Body('avatar') avatar?: string,
  ) {
    return this.userService.updateUserInfo(req.user.id, username, avatar);
  }

  @UseGuards(JwtGuard)
  @Put('change-password')
  async changePassword(
    @Request() req,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword?: string,
  ) {
    return this.userService.changePassword(
      req.user.id,
      oldPassword,
      newPassword,
    );
  }
}
