import { CurrentUserInputDto, CurrentUserOutputDto } from '../dto'
export interface IGetCurrentUserUseCase {
  execute(input: CurrentUserInputDto): Promise<CurrentUserOutputDto>
}

export const GET_CURRENT_USER = Symbol('IGetCurrentUserUseCase')
