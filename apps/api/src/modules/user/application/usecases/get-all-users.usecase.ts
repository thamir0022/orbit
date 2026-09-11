import { Inject } from '@nestjs/common'
import { GetAllUsersInput, GetAllUsersOutput } from '../dto'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../repository/user.repository.interface'
import { IGetAllUsersUseCase } from './get-all-users.interface'
import { UserMapper } from '../mappers/user.mapper'

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userReposotory: IUserRepository
  ) {}
  async execute({
    page,
    limit,
    search,
    status,
  }: GetAllUsersInput): Promise<GetAllUsersOutput> {
    const { data: users, meta } = await this.userReposotory.findAll({
      page,
      limit,
      search,
      status,
    })

    return {
      users: users.map((user) => UserMapper.toOutputDto(user)),
      meta,
    }
  }
}
