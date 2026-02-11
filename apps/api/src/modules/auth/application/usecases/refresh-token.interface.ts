import { RefreshTokenCommand } from '../dto/refresh-token.command'
import { RefreshTokenResult } from '../dto/refresh-token.result'

export interface IRefreshTokenInterface {
  execute(command: RefreshTokenCommand): Promise<RefreshTokenResult>
}

export const REFRESH_TOKEN = Symbol('IRefreshTokenInterface')
