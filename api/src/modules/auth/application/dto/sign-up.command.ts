import { ClientInfo } from './sign-in.command'

export interface SignInCommand {
  firstName: string
  lastName: string
  email: string
  password: string
  clientInfo: ClientInfo
}
