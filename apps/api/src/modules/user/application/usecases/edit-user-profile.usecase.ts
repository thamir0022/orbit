import { Inject, Logger } from '@nestjs/common'
import { EditUserInput, EditUserOutput } from '../dto'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../repository/user.repository.interface'
import { IEditUserProfileUseCase } from './edit-user-profile.interface'
import {
  UserId,
  AccountNotFoundException,
  UserStatus,
  AccountInactiveException,
} from '../../domain'
import { UserMapper } from '../mappers/user.mapper'

export class EditUserProfileUseCase implements IEditUserProfileUseCase {
  private readonly logger = new Logger(EditUserProfileUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute({
    userId,
    firstName,
    lastName,
    displayName,
  }: EditUserInput): Promise<EditUserOutput> {
    this.logger.log(`Profile update request from user ${userId}`)

    const userIdResult = UserId.create(userId)

    const user = await this.userRepository.findById(userIdResult)

    if (!user) throw new AccountNotFoundException()

    if (user.status !== UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

    user.updateProfile({ firstName, lastName, displayName })

    await this.userRepository.save(user)

    this.logger.log(`Successfully updated user profile ${userId}`)

    return {
      user: UserMapper.toOutputDto(user),
    }
  }
}
