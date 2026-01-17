import { UserResponseDto } from '@/modules/auth/application'
import {
  AuthProvider,
  Email,
  Password,
  User,
  UserId,
  UserPreferences,
  UserStatus,
  UserProps,
} from '@/modules/user/domain'
import { type UserDocument } from '@/modules/user/infrastructure'

/**
 * User Mapper
 * Transforms between domain entities, persistence models, and DTOs
 */
export class UserMapper {
  /**
   * Map domain entity to response DTO
   */
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.userId.value,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      email: user.email.value,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      authProvider: user.authProvider,
      status: user.status,
      preferences: {
        theme: user.preferences.preferences.theme,
        notifications: user.preferences.preferences.notifications,
      },
      timezone: user.timezone,
      locale: user.locale,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  /**
   * Map domain entity to persistence model
   */

  static toPersistence(user: User): Partial<UserDocument> {
    return {
      id: user.userId.value,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      email: user.email.value,
      passwordHash: user.passwordHash?.value,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      mfaBackupCodes: user.mfaBackupCodes,
      loginAttempts: user.loginAttempts,
      lockedUntil: user.lockedUntil,
      authProvider: user.authProvider,
      googleId: user.googleId,
      githubId: user.githubId,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      preferences: user.preferences.preferences,
      timezone: user.preferences.timezone,
      locale: user.preferences.locale,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    }
  }

  /**
   * Map persistence model to domain entity
   */

  static toDomain(document: UserDocument): User {
    const props: UserProps = {
      id: UserId.fromString(document.id),
      firstName: document.firstName,
      lastName: document.lastName,
      displayName: document.displayName,
      email: Email.create(document.email).value,
      passwordHash: document.passwordHash
        ? Password.fromHashed(document.passwordHash)
        : undefined,
      roleId: document.roleId,
      avatarUrl: document.avatarUrl,
      emailVerified: document.emailVerified,
      mfaEnabled: document.mfaEnabled,
      mfaBackupCodes: document.mfaBackupCodes || [],
      loginAttempts: document.loginAttempts || 0,
      lockedUntil: document.lockedUntil,
      authProvider: document.authProvider as AuthProvider,
      googleId: document.googleId,
      githubId: document.githubId,
      status: document.status as UserStatus,
      lastLoginAt: document.lastLoginAt,
      lastActiveAt: document.lastActiveAt,
      preferences: UserPreferences.create(
        document.preferences,
        document.timezone,
        document.locale
      ),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deletedAt: document.deletedAt,
    }

    return User.reconstitute(props)
  }
}
