import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, UserType } from '@swifttrack/shared';
import { JwtService as SecurityJwtService, PasswordService } from '@swifttrack/security';

interface JwtPayload {
  sub: string;
  email: string;
  userType: UserType;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly securityJwtService: SecurityJwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.findUserByEmail(registerDto.email);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // Hash password
      const passwordHash = await this.passwordService.hash(registerDto.password);

      // Create user
      const user = await this.createUser({
        ...registerDto,
        passwordHash,
      });

      // Generate tokens
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        userType: user.userType,
      };

      const accessToken = await this.securityJwtService.signAccessToken(payload);
      const refreshToken = await this.securityJwtService.signRefreshToken(payload);

      // Store refresh token
      await this.storeRefreshToken(user.id, refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.findUserByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.passwordService.verify(
        user.passwordHash,
        loginDto.password
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        userType: user.userType,
      };

      const accessToken = await this.securityJwtService.signAccessToken(payload);
      const refreshToken = await this.securityJwtService.signRefreshToken(payload);

      await this.storeRefreshToken(user.id, refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Login failed');
    }
  }

  async driverLogin(loginDto: LoginDto) {
    try {
      const driver = await this.findDriverByEmail(loginDto.email);
      if (!driver) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.passwordService.verify(
        driver.passwordHash,
        loginDto.password
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = {
        sub: driver.id,
        email: driver.email,
        userType: UserType.DRIVER,
      };

      const accessToken = await this.securityJwtService.signAccessToken(payload);
      const refreshToken = await this.securityJwtService.signRefreshToken(payload);

      await this.storeRefreshToken(driver.id, refreshToken);

      return {
        driver: {
          id: driver.id,
          email: driver.email,
          nic: driver.nic,
          vehicleReg: driver.vehicleReg,
          mobile: driver.mobile,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Driver login failed');
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.securityJwtService.verifyRefreshToken(refreshToken);
      
      // Check if refresh token is stored
      const storedToken = await this.getStoredRefreshToken(payload.sub);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = await this.securityJwtService.signAccessToken({
        sub: payload.sub,
        email: payload.email,
        userType: payload.userType,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(accessToken: string) {
    try {
      const payload = await this.securityJwtService.verifyAccessToken(accessToken);
      await this.removeRefreshToken(payload.sub);
      await this.blacklistToken(accessToken);
      
      return { message: 'Logout successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get profile');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isCurrentPasswordValid = await this.passwordService.verify(
        user.passwordHash,
        currentPassword
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const newPasswordHash = await this.passwordService.hash(newPassword);
      await this.updateUserPassword(userId, newPasswordHash);

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to change password');
    }
  }

  // Private helper methods - these would typically interact with a database
  private async findUserByEmail(email: string): Promise<any> {
    // Implementation would query the database
    // For now, returning null as placeholder
    return null;
  }

  private async findDriverByEmail(email: string): Promise<any> {
    // Implementation would query the database
    return null;
  }

  private async findUserById(id: string): Promise<any> {
    // Implementation would query the database
    return null;
  }

  private async createUser(userData: any): Promise<any> {
    // Implementation would create user in database
    return null;
  }

  private async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    // Implementation would update password in database
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Implementation would store refresh token in Redis
  }

  private async getStoredRefreshToken(userId: string): Promise<string | null> {
    // Implementation would get refresh token from Redis
    return null;
  }

  private async removeRefreshToken(userId: string): Promise<void> {
    // Implementation would remove refresh token from Redis
  }

  private async blacklistToken(token: string): Promise<void> {
    // Implementation would blacklist token in Redis
  }
}
