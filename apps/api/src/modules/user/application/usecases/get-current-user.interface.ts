import { CurrentUserRequestDto, CurrentUserResponseDto } from '../dto'
export interface IGetCurrentUserUseCase {
  execute(dto: CurrentUserRequestDto): Promise<CurrentUserResponseDto>
}

export const GET_CURRENT_USER = Symbol('IGetCurrentUserUseCase')
