import { GetAllUsersInput } from '../dto'
import { GetAllUsersOutput } from '../dto'

export interface IGetAllUsersUseCase {
  execute(input: GetAllUsersInput): Promise<GetAllUsersOutput>
}

export const GET_ALL_USERS = Symbol('GET_ALL_USERS')
