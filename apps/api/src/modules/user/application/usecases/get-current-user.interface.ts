import { CurrentUserCommand } from '../dto/current-user.command'
import { CurrentUserResult } from '../dto/current-user.result'

export interface IGetCurrentUserUseCase {
  execute(command: CurrentUserCommand): Promise<CurrentUserResult>
}

export const GET_CURRENT_USER = Symbol('IGetCurrentUserUseCase')
