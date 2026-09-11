import { UserStatus } from '../../domain'

export interface AuthenticatedUser {
  id: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  avatarUrl: string | undefined
  emailVerified: boolean | undefined
  mfaEnabled: boolean
  status: UserStatus
  preferences: {
    theme: string
    notifications: {
      email: boolean
      push: boolean
      inApp: boolean
    }
  }
  timezone: string | undefined
  locale: string | undefined
}
