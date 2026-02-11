import { ClientInfo } from '../interfaces/auth.interface'

export interface SignUpCommand {
  firstName: string
  lastName: string
  email: string
  password: string
  clientInfo: ClientInfo
}
