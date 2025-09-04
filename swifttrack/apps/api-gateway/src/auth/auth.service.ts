import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, UserType, JwtPayload } from '@swifttrack/shared';
import { JwtService as SecurityJwtService, PasswordService } from '@swifttrack/security';

@Injectable()
export class AuthService {
  private mockUsers: any[] = []; // Temporary in-memory storage for development

  constructor(
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
      console.log(`✅ [AUTH-SERVICE] User created successfully with ID: ${user.id}`);

      // Generate tokens
      console.log(`🎫 [AUTH-SERVICE] Generating JWT tokens for user: ${user.id}`);
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        type: 'user',
        userType: user.userType,
      };

      const accessToken = await this.securityJwtService.signAccessToken(payload);
      const refreshToken = await this.securityJwtService.signRefreshToken(payload);
      console.log(`✅ [AUTH-SERVICE] JWT tokens generated successfully`);

      // Store refresh token
      console.log(`💾 [AUTH-SERVICE] Storing refresh token for user: ${user.id}`);
      await this.storeRefreshToken(user.id, refreshToken);
      console.log(`✅ [AUTH-SERVICE] Registration completed successfully for: ${registerDto.email}`);

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
      console.log(`✅ [AUTH-SERVICE] User found: ${user.id}`);

      console.log(`🔐 [AUTH-SERVICE] Verifying password for user: ${user.id}`);
      const isPasswordValid = await this.passwordService.verify(
        user.passwordHash,
        loginDto.password
      );

      if (!isPasswordValid) {
        console.log(`❌ [AUTH-SERVICE] Invalid password for user: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      console.log(`✅ [AUTH-SERVICE] Password verified successfully for user: ${user.id}`);

      console.log(`🎫 [AUTH-SERVICE] Generating JWT tokens for login: ${user.id}`);
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        type: 'user',
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
        type: 'driver',
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
    console.log(`🔍 [AUTH-SERVICE] Searching for user in mock storage: ${email}`);
    const user = this.mockUsers.find(u => u.email === email);
    if (user) {
      console.log(`✅ [AUTH-SERVICE] User found: ${email}`);
    } else {
      console.log(`❌ [AUTH-SERVICE] User not found: ${email}`);
    }
    return user || null;
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
    console.log(`💾 [AUTH-SERVICE] Creating user in mock storage with email: ${userData.email}`);
    
    // For now, create a mock user object and store in memory
    // In a real implementation, this would save to database and return the created user
    const mockUser = {
      id: Date.now(), // Use timestamp as a temporary ID
      userId: Date.now(),
      email: userData.email,
      name: userData.name,
      userType: userData.userType || 'CLIENT',
      passwordHash: userData.passwordHash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Store in mock array
    this.mockUsers.push(mockUser);
    
    console.log(`✅ [AUTH-SERVICE] Mock user created and stored with ID: ${mockUser.id}`);
    console.log(`📊 [AUTH-SERVICE] Total users in mock storage: ${this.mockUsers.length}`);
    return mockUser;
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
