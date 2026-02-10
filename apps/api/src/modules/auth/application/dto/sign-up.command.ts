import { ClientInfo } from '../interfaces/auth.interface'

export interface SignInCommand {
  firstName: string
  lastName: string
  email: string
  password: string
  clientInfo: ClientInfo
}
