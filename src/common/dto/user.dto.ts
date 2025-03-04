import { IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class LoginDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}

export class UpdateUserDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}
