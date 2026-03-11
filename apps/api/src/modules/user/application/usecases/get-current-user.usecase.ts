import { Inject, Injectable } from '@nestjs/common'
import { IGetCurrentUserUseCase } from './get-current-user.interface'
import { UserId, UserNotFoundException } from '../../domain'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../repository/user.repository.interface'
import { UserMapper } from '../mappers/user.mapper'
import { CurrentUserRequestDto, CurrentUserResponseDto } from '../dto'

@Injectable()
export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository
  ) {}
  async execute(dto: CurrentUserRequestDto): Promise<CurrentUserResponseDto> {
    const userId = UserId.fromString(dto.userId)

    const user = await this._userRepository.findById(userId)

    if (!user) throw new UserNotFoundException(userId.value)

    return {
      user: UserMapper.toResponseDto(user),
    }
  }
}
