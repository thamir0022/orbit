import type { UserStatus } from '@/modules/user/domain';
import type { AuthProvider } from '@/modules/user/domain';

/**
 * User Response DTO
 * Data structure returned to the presentation layer
 */
export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  authProvider: AuthProvider;
  status: UserStatus;
  preferences: {
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  timezone: string;
  locale: string;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
