import { UserType } from '../utils/enums';

export interface User {
  userId: number;
  email: string;
  userType: UserType;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Driver {
  driverId: number;
  email: string;
  nic?: string;
  vehicleReg?: string;
  mobile?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserSession {
  sessionId: string;
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface JwtPayload {
  sub: number;
  email: string;
  type: 'user' | 'driver';
  userType?: UserType;
  iat?: number;
  exp?: number;
}
