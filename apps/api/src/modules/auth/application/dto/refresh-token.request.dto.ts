import { ClientInfo } from '../interfaces/auth.interface'

export interface RefreshTokenRequestDto {
  token: string
  clientInfo: ClientInfo
}
