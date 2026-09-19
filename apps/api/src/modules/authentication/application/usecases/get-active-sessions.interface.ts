import { GetActiveSessionsInputDto, GetActiveSessionsOutputDto } from '../dto'

export interface IGetActiveSessionsUseCase {
  execute(input: GetActiveSessionsInputDto): Promise<GetActiveSessionsOutputDto>
}

export const GET_ACTIVE_SESSIONS = Symbol('IGetActiveSessionsUseCase')
