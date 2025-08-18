import { IsEmail, IsEnum, IsString, MinLength, IsOptional } from 'class-validator';
import { UserType } from '../utils/enums';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType = UserType.CLIENT;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    userType: UserType;
  };
}
