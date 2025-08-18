import * as argon2 from 'argon2';

export class PasswordService {
  private readonly options: argon2.Options;

  constructor() {
    this.options = {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB
      timeCost: 3,
      parallelism: 1,
    };
  }

  async hash(password: string): Promise<string> {
    try {
      return await argon2.hash(password, this.options);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      throw new Error('Failed to verify password');
    }
  }

  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password',
      '123456',
      '12345678',
      'qwerty',
      'abc123',
      'password123',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
