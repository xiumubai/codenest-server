import { ExecutionContext } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';

export class OptionalJwtGuard extends JwtGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // 尝试进行 JWT 认证
      await super.canActivate(context);
      return true;
    } catch (error) {
      // 如果认证失败，仍然允许请求通过，但不设置用户信息
      return true;
    }
  }
}
