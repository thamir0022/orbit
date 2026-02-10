import { User } from '@/modules/user/domain'
import { SignInResult } from '../dto/sign-in.result'

export type ClientInfo = {
  ipAddress: string
  userAgent: string
}

export interface IAuthService {
  validateUser(email: string, password: string): Promise<User>
  signIn(user: User, clientInfo: ClientInfo): Promise<SignInResult>
}

export const AUTH_SERVICE = Symbol('IAuthService')
