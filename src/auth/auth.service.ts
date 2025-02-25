import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: any) {
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  async clearToken(token: string) {
    try {
      // 使token立即失效
      const payload = this.jwtService.decode(token);
      if (payload) {
        // 重新签发一个立即过期的token
        return this.jwtService.sign(payload, { expiresIn: 0 });
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
