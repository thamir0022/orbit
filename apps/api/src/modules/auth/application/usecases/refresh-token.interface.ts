import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '../dto'

export interface IRefreshTokenUseCase {
  execute(command: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto>
}

export const REFRESH_TOKEN = Symbol('IRefreshTokenUseCase')
