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
import {
  RegisterDto,
  LoginDto,
  UpdateUserDto,
  ChangePasswordDto,
} from '../common/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 用户注册
   * @param registerDto 注册信息数据传输对象
   * @returns 返回注册成功的用户信息
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.userService.register(
      registerDto.phone,
      registerDto.password,
      registerDto.username,
      registerDto.avatar,
    );
  }

  /**
   * 用户登录
   * @param loginDto 登录信息数据传输对象
   * @returns 返回登录成功的令牌和用户信息
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto.phone, loginDto.password);
  }

  /**
   * 用户退出登录
   * @param req 请求对象，包含用户认证信息
   * @returns 返回退出登录的处理结果
   */
  @UseGuards(JwtGuard)
  @Get('logout')
  async logout(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.userService.logout(token);
  }

  /**
   * 获取用户信息
   * @param req 请求对象，包含用户认证信息
   * @returns 返回当前登录用户的详细信息
   */
  @UseGuards(JwtGuard)
  @Get('info')
  async getUserInfo(@Request() req) {
    return this.userService.getUserInfo(req.user.id);
  }

  /**
   * 检查用户名是否唯一
   * @param req 请求对象，包含用户认证信息
   * @param username 要检查的用户名
   * @returns 返回用户名是否可用的检查结果
   */
  @UseGuards(JwtGuard)
  @Get('check-username')
  async checkUsernameUnique(
    @Request() req,
    @Query('username') username: string,
  ) {
    return this.userService.checkUsernameUnique(username, req.user.id);
  }

  /**
   * 更新用户信息
   * @param req 请求对象，包含用户认证信息
   * @param updateUserDto 更新用户信息的数据传输对象
   * @returns 返回更新后的用户信息
   */
  @UseGuards(JwtGuard)
  @Put('update')
  async updateUserInfo(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserInfo(
      req.user.id,
      updateUserDto.username,
      updateUserDto.avatar,
    );
  }

  /**
   * 修改用户密码
   * @param req 请求对象，包含用户认证信息
   * @param changePasswordDto 修改密码的数据传输对象
   * @returns 返回密码修改的处理结果
   */
  @UseGuards(JwtGuard)
  @Put('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(
      req.user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}
