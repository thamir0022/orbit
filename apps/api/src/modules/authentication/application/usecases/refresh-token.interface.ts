import { RefreshTokenInput, RefreshTokenOutput } from '../dto'

export interface IRefreshTokenUseCase {
  execute(input: RefreshTokenInput): Promise<RefreshTokenOutput>
}

export const REFRESH_TOKEN = Symbol('IRefreshTokenUseCase')
