import { ClientInfo } from '../interfaces/auth.interface'

export interface SignInCommand {
  email: string
  password: string
  clientInfo: ClientInfo
}
