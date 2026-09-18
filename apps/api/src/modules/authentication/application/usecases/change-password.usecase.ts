import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common'

import {
  AccountNotFoundException,
  InvalidPasswordException,
  Password,
  UserId,
} from '@/modules/user/domain'
import { IUserRepository, USER_REPOSITORY } from '@/modules/user/application'
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@/shared/application/ports/password-hasher.interface'

import { ChangePasswordInput, ChangePasswordOutputDto } from '../dto'
import { IChangePasswordUseCase } from './change-password.interface'
import { UserMapper } from '@/modules/user/application/mappers/user.mapper'
import { isAfter, subHours } from 'date-fns'

@Injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: ChangePasswordInput): Promise<ChangePasswordOutputDto> {
    const userId = UserId.create(input.userId)

    const user = await this.userRepository.findById(userId)

    if (!user) throw new AccountNotFoundException()

    /**
     * Existing password
     *
     * A user who already has a password must prove
     * knowledge of the current password.
     */
    if (user.hasPassword && user.passwordHash) {
      if (!input.currentPassword)
        throw new BadRequestException('Current password is required')

      const isCurrentPasswordValid = await this.passwordHasher.compare(
        input.currentPassword,
        user.passwordHash.value
      )

      if (!isCurrentPasswordValid)
        throw new InvalidPasswordException(['Current password is invalid'])

      const isSamePassword = await this.passwordHasher.compare(
        input.newPassword,
        user.passwordHash.value
      )

      if (isSamePassword)
        throw new BadRequestException(
          'New password must be different from your current password'
        )
    }

    const cooldownStart = subHours(new Date(), 24)

    if (
      user.passwordUpdatedAt &&
      isAfter(user.passwordUpdatedAt, cooldownStart)
    )
      throw new HttpException(
        'Password can only be changed once every 24 hours',
        HttpStatus.TOO_MANY_REQUESTS
      )

    const newPassword = Password.create(input.newPassword)

    const newPasswordHash = await this.passwordHasher.hash(newPassword.value)

    user.passwordHash = Password.fromHashed(newPasswordHash)
    user.hasPassword = true
    user.passwordUpdatedAt = new Date()

    await this.userRepository.save(user)

    return { user: UserMapper.toOutputDto(user) }
  }
}
