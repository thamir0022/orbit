import { Inject, Injectable } from '@nestjs/common'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  AuthProvider,
  Email,
  InvalidEmailException,
  InvalidPasswordException,
  Password,
  User,
  AccountAlreadyExistsException,
} from '@/modules/user/domain'
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '@/shared/application/ports/password-hasher.interface'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import { CreatePlatformAdminInput, CreatePlatformAdminOutput } from '../dtos'
import { ICreatePlatformAdminUseCase } from './create-platform-admin.interface'
import {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '@/modules/authorization/application/repositories/role.repository'
import {
  USER_ROLE_REPOSITORY,
  type UserRoleRepository,
} from '@/modules/authorization/application/repositories/user-role.repository'
import { RoleName } from '@/modules/authorization/domain/value-objects/role-name.vo'
import { UserRole } from '@/modules/authorization/domain/entities/user-role.entity'

@Injectable()
export class CreatePlatformAdminUseCase implements ICreatePlatformAdminUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepository: UserRoleRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(
    input: CreatePlatformAdminInput
  ): Promise<CreatePlatformAdminOutput> {
    const emailResult = Email.create(input.email)

    if (emailResult.isFailure) {
      throw new InvalidEmailException(emailResult.error)
    }

    const exists = await this.userRepository.existsByEmail(emailResult.value)

    if (exists) {
      throw new AccountAlreadyExistsException(emailResult.value)
    }

    const passwordResult = Password.create(input.password)

    if (passwordResult.isFailure) {
      throw new InvalidPasswordException(passwordResult.error)
    }

    const roleNameResult = RoleName.create('platform_admin')

    if (roleNameResult.isFailure) {
      throw new Error(roleNameResult.error)
    }

    const platformAdminRole = await this.roleRepository.findSystemRoleByName(
      roleNameResult.value
    )

    if (!platformAdminRole) {
      throw new Error(
        'System role "platform_admin" not found. Run role synchronization first.'
      )
    }

    const passwordHash = await this.passwordHasher.hash(passwordResult.value)

    const user = User.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: emailResult.value,
      authProvider: AuthProvider.EMAIL,
      emailVerified: true,
      passwordHash: Password.fromHashed(passwordHash),
    })

    user.recordLogin()

    const userRole = UserRole.create({
      userId: user.userId,
      roleId: platformAdminRole.id,
    })

    await this.transactionManager.executeTransaction(async (session) => {
      await this.userRepository.save(user, {
        session,
      })

      await this.userRoleRepository.save(userRole, {
        session,
      })
    })

    return {
      userId: user.userId.value,
      email: user.email.value,
    }
  }
}
