import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { SignUpCommand } from '@/modules/user/application'
import { Inject, Logger } from '@nestjs/common'
import {
  PASSWORD_HASHER,
  USER_REPOSITORY,
  type IPasswordHasher,
  type IUserRepository,
} from '@/modules/user/application'
import { UserResponseDto } from '@/modules/user/application'
import {
  Email,
  EmailAlreadyExistsException,
  InvalidEmailException,
  InvalidPasswordException,
  Password,
  User,
} from '@/modules/user/domain'
import { UserMapper } from '@/modules/user/application'

@CommandHandler(SignUpCommand)
export class SignUpHandler implements ICommandHandler<SignUpCommand> {
  private readonly logger = new Logger(SignUpHandler.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SignUpCommand): Promise<UserResponseDto> {
    this.logger.log(`Processing sign-up for email: ${command.email}`)

    // 1. Create and validate email value object (Domain validation)
    const emailResult = Email.create(command.email)
    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const email = emailResult.value

    // 2. Check if user already exists (Application rule via Port)
    const existingUser = await this.userRepository.existsByEmail(email)
    if (existingUser) throw new EmailAlreadyExistsException(email.value)

    // 3. Create and validate password value object (Domain validation)
    const passwordResult = Password.create(command.password)
    if (passwordResult.isFailure)
      throw new InvalidPasswordException(passwordResult.error)

    // 4. Hash the password (Infrastructure concern via Port)
    const hashedPassword = await this.passwordHasher.hash(command.password)
    const password = Password.fromHashed(hashedPassword)

    // 5. Create user aggregate (Domain factory)
    const user = User.create({
      firstName: command.firstName,
      lastName: command.lastName,
      email: email,
      passwordHash: password,
    })

    // 6. Persist user (Infrastructure concern via Port)
    const savedUser = await this.userRepository.save(user)

    // 7. Publish domain events
    const events = savedUser.domainEvents
    events.forEach((event) => this.eventBus.publish(event))
    savedUser.clearEvents()

    this.logger.log(
      `User created successfully with ID: ${savedUser.userId.value}`
    )

    // 8. Map to response DTO (Application concern)
    return UserMapper.toResponseDto(savedUser)
  }
}
