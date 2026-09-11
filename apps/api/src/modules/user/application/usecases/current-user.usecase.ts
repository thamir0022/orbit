import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { IGetCurrentUserUseCase } from './current-user.interface'
import { UserId, AccountNotFoundException, UserStatus } from '../../domain'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../repository/user.repository.interface'
import { UserMapper } from '../mappers/user.mapper'
import { CurrentUserInputDto, CurrentUserOutputDto } from '../dto'

@Injectable()
export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  private readonly logger = new Logger(GetCurrentUserUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}
  async execute(input: CurrentUserInputDto): Promise<CurrentUserOutputDto> {
    this.logger.debug(`Fetching profile for user ID: ${input.userId}`)

    const userId = UserId.fromString(input.userId)

    const user = await this.userRepository.findById(userId)

    // 1. Existence Check
    if (!user) {
      this.logger.warn(
        `Valid JWT presented, but user not found in DB: ${input.userId}`
      )
      throw new AccountNotFoundException()
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(
        `Attempted access by ${user.status} user: ${input.userId}`
      )

      throw new ForbiddenException(`This account has been ${user.status}.`)
    }

    return {
      user: UserMapper.toOutputDto(user),
    }
  }
}
