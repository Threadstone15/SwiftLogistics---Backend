import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, UserType, JwtPayload } from '@swifttrack/shared';
import { JwtService as SecurityJwtService, PasswordService } from '@swifttrack/security';
import { User, Driver } from '@swifttrack/db';

@Injectable()
export class AuthService {
  private refreshTokens = new Map<string, string>(); // In production, use Redis
  private blacklistedTokens = new Set<string>(); // In production, use Redis

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly securityJwtService: SecurityJwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(registerDto: RegisterDto) {
    console.log(`🔧 [AUTH-SERVICE] Starting user registration process`);
    console.log(`📧 Email: ${registerDto.email} | User Type: ${registerDto.userType || 'CLIENT'}`);
    
    try {
      // Check if user already exists
      console.log(`🔍 [AUTH-SERVICE] Checking if user exists: ${registerDto.email}`);
      const existingUser = await this.findUserByEmail(registerDto.email);
      if (existingUser) {
        console.log(`❌ [AUTH-SERVICE] User already exists: ${registerDto.email}`);
        throw new ConflictException('User already exists');
      }
      console.log(`✅ [AUTH-SERVICE] Email is available: ${registerDto.email}`);

      // Hash password
      console.log(`🔐 [AUTH-SERVICE] Hashing password for: ${registerDto.email}`);
      const passwordHash = await this.passwordService.hash(registerDto.password);
      console.log(`✅ [AUTH-SERVICE] Password hashed successfully`);

      // Create user
      console.log(`👤 [AUTH-SERVICE] Creating new user: ${registerDto.email}`);
      const user = await this.createUser({
        ...registerDto,
        passwordHash,
      });
      console.log(`✅ [AUTH-SERVICE] User created successfully with ID: ${user.userId}`);

      // Generate tokens
      console.log(`🎫 [AUTH-SERVICE] Generating JWT tokens for user: ${user.userId}`);
      const payload: JwtPayload = {
        sub: user.userId,
        email: user.email,
        type: 'user',
        userType: user.userType,
      };

      const accessToken = await this.securityJwtService.signAccessToken(payload);
      const refreshToken = await this.securityJwtService.signRefreshToken(payload);
      console.log(`✅ [AUTH-SERVICE] JWT tokens generated successfully`);

      // Store refresh token
      console.log(`💾 [AUTH-SERVICE] Storing refresh token for user: ${user.userId}`);
      await this.storeRefreshToken(user.userId.toString(), refreshToken);
      console.log(`✅ [AUTH-SERVICE] Registration completed successfully for: ${registerDto.email}`);

      return {
        user: {
          id: user.userId,
          email: user.email,
          userType: user.userType,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      console.error(`💥 [AUTH-SERVICE] Registration failed for ${registerDto.email}:`, error.message);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    console.log(`🔑 [AUTH-SERVICE] Starting login process for: ${loginDto.email}`);
    
    try {
      console.log(`🔍 [AUTH-SERVICE] Finding user by email: ${loginDto.email}`);
      const user = await this.findUserByEmail(loginDto.email);
      if (!user) {
        console.log(`❌ [AUTH-SERVICE] User not found: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      console.log(`✅ [AUTH-SERVICE] User found: ${user.userId}`);

      console.log(`🔐 [AUTH-SERVICE] Verifying password for user: ${user.userId}`);
      const isPasswordValid = await this.passwordService.verify(
        user.passwordHash,
        loginDto.password
      );

      if (!isPasswordValid) {
        console.log(`❌ [AUTH-SERVICE] Invalid password for user: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      console.log(`✅ [AUTH-SERVICE] Password verified successfully for user: ${user.userId}`);

      console.log(`🎫 [AUTH-SERVICE] Generating JWT tokens for login: ${user.userId}`);
      const payload: JwtPayload = {
        sub: user.userId,
        email: user.email,
        type: 'user',
        userType: user.userType,
      };

      const accessToken = await this.securityJwtService.signAccessToken(payload);
      const refreshToken = await this.securityJwtService.signRefreshToken(payload);

      await this.storeRefreshToken(user.userId.toString(), refreshToken);

      return {
        user: {
          id: user.userId,
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
        sub: driver.driverId,
        email: driver.email,
        type: 'driver',
        userType: UserType.DRIVER,
      };

      const accessToken = await this.securityJwtService.signAccessToken(payload);
      const refreshToken = await this.securityJwtService.signRefreshToken(payload);

      await this.storeRefreshToken(driver.driverId.toString(), refreshToken);

      return {
        driver: {
          id: driver.driverId,
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
      const storedToken = await this.getStoredRefreshToken(payload.sub.toString());
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = await this.securityJwtService.signAccessToken({
        sub: payload.sub,
        email: payload.email,
        type: payload.type,
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
      await this.removeRefreshToken(payload.sub.toString());
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
        id: user.userId,
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
  private async findUserByEmail(email: string): Promise<User | null> {
    console.log(`🔍 [AUTH-SERVICE] Searching for user in database: ${email}`);
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user) {
        console.log(`✅ [AUTH-SERVICE] User found in database: ${email}`);
      } else {
        console.log(`❌ [AUTH-SERVICE] User not found in database: ${email}`);
      }
      return user;
    } catch (error) {
      console.error(`💥 [AUTH-SERVICE] Database error finding user ${email}:`, error.message);
      return null;
    }
  }

  private async findDriverByEmail(email: string): Promise<Driver | null> {
    console.log(`🔍 [AUTH-SERVICE] Searching for driver in database: ${email}`);
    try {
      const driver = await this.driverRepository.findOne({ where: { email } });
      if (driver) {
        console.log(`✅ [AUTH-SERVICE] Driver found in database: ${email}`);
      } else {
        console.log(`❌ [AUTH-SERVICE] Driver not found in database: ${email}`);
      }
      return driver;
    } catch (error) {
      console.error(`💥 [AUTH-SERVICE] Database error finding driver ${email}:`, error.message);
      return null;
    }
  }

  private async findUserById(id: string): Promise<User | null> {
    console.log(`🔍 [AUTH-SERVICE] Searching for user by ID in database: ${id}`);
    try {
      const user = await this.userRepository.findOne({ where: { userId: parseInt(id) } });
      if (user) {
        console.log(`✅ [AUTH-SERVICE] User found by ID in database: ${id}`);
      } else {
        console.log(`❌ [AUTH-SERVICE] User not found by ID in database: ${id}`);
      }
      return user;
    } catch (error) {
      console.error(`💥 [AUTH-SERVICE] Database error finding user by ID ${id}:`, error.message);
      return null;
    }
  }

  private async createUser(userData: any): Promise<User> {
    console.log(`💾 [AUTH-SERVICE] Creating user in database with email: ${userData.email}`);
    
    try {
      const user = this.userRepository.create({
        email: userData.email,
        name: userData.name,
        userType: userData.userType || UserType.CLIENT,
        passwordHash: userData.passwordHash,
        isActive: true,
      });
      
      const savedUser = await this.userRepository.save(user);
      console.log(`✅ [AUTH-SERVICE] User created successfully with ID: ${savedUser.userId}`);
      return savedUser;
    } catch (error) {
      console.error(`� [AUTH-SERVICE] Database error creating user:`, error.message);
      throw new BadRequestException('Failed to create user');
    }
  }

  private async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await this.userRepository.update(userId, { passwordHash });
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    this.refreshTokens.set(userId, refreshToken);
  }

  private async getStoredRefreshToken(userId: string): Promise<string | null> {
    return this.refreshTokens.get(userId) || null;
  }

  private async removeRefreshToken(userId: string): Promise<void> {
    this.refreshTokens.delete(userId);
  }

  private async blacklistToken(token: string): Promise<void> {
    // Implementation would blacklist token in Redis
  }
}
