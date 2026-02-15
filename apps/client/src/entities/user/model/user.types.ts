export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export interface User {
  id: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  avatarUrl?: string
  emailVerified?: boolean
  mfaEnabled: boolean
  authProvider: AuthProvider
  status: UserStatus
  preferences: {
    theme: string
    notifications: {
      email: boolean
      push: boolean
      inApp: boolean
    }
  }
  timezone: string
  locale: string
  lastLoginAt?: Date
  lastActiveAt?: Date
  createdAt: Date
  updatedAt: Date
}
