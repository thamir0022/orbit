import { Email, Password, UserPreferences } from '@/modules/user/domain'
import { AuthProvider, UserStatus } from '@/modules/user/domain'
import { UserId } from '@/modules/user/domain'

export interface UserProps {
  id: UserId
  firstName: string
  lastName: string
  displayName: string
  email: Email
  passwordHash?: Password
  roleId?: string // UPDATE THIS WITH
  avatarUrl?: string
  emailVerified: boolean

  // MFA
  mfaEnabled: boolean
  mfaBackupCodes: string[]

  // Rate limiting
  loginAttempts?: number
  lockedUntil?: Date

  // OAuth
  authProvider: AuthProvider
  googleId?: string
  githubId?: string

  // User status
  status: UserStatus
  lastLoginAt?: Date
  lastActiveAt?: Date

  // Preferences
  preferences: UserPreferences

  // Timestramps
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface CreateUserProps {
  firstName: string
  lastName: string
  email: Email
  passwordHash: Password
  authProvider?: AuthProvider
  avatarUrl?: string
}
