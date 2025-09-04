import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtService as SecurityJwtService, PasswordService } from '@swifttrack/security';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshStrategy,
    AuthGuard,
    RolesGuard,
    {
      provide: SecurityJwtService,
      useFactory: (configService: ConfigService) => {
        return new SecurityJwtService(
          configService.get<string>('jwt.secret'),
          configService.get<string>('jwt.refreshSecret'),
          configService.get<string>('jwt.expiresIn'),
          configService.get<string>('jwt.refreshExpiresIn')
        );
      },
      inject: [ConfigService],
    },
    PasswordService,
  ],
  exports: [AuthService, AuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
