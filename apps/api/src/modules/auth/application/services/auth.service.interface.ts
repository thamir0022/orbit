import { User } from '@/modules/user/domain'

export interface IAuthService {
  validateUser(email: string, password: string): Promise<User>
}

export const AUTH_SERVICE = Symbol('IAuthService')
