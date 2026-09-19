import { Email, Password, UserPreferences } from '@/modules/user/domain'
import { AuthProvider, UserStatus } from '@/modules/user/domain'
import { UserId } from '@/modules/user/domain'

export interface UserProps {
  id: UserId
  firstName: string
  lastName: string
  displayName: string
  email: Email

  passwordHash: Password | undefined
  hasPassword: boolean

  avatarUrl: string | undefined

  emailVerified: boolean

  // MFA
  mfaEnabled: boolean
  mfaBackupCodes: string[]

  // Rate limiting
  loginAttempts: number | undefined
  lockedUntil: Date | undefined
  passwordUpdatedAt?: Date

  // OAuth
  authProvider: AuthProvider
  oauthProviderId: string | undefined

  // User status
  status: UserStatus

  lastLoginAt: Date | undefined

  // Preferences
  preferences: UserPreferences

  // Timestamps
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | undefined
}

export interface CreateUserProps {
  firstName: string
  lastName: string
  email: Email
  emailVerified?: boolean
  passwordHash?: Password
  authProvider: AuthProvider
  oauthProviderId?: string
  avatarUrl?: string
}
