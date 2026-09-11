import { ClientInfo } from '../contracts/client-info'

export interface SignInInputDto {
  email: string
  password: string
  clientInfo: ClientInfo
}
