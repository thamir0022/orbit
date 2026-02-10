import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'
import { UserStatus } from '@/modules/user/domain'

export class EmailAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super({
      code: 'EMAIL_ALREADY_EXISTS',
      message: `User with email ${email} already exists`,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}

export class InvalidEmailException extends DomainException {
  constructor(message: string) {
    super({ code: 'INVALID_EMAIL', message })
  }
}

export class InvalidPasswordException extends DomainException {
  constructor(message: string[]) {
    super({ code: 'INVALID_PASSWORD', message: message.join(';') })
  }
}

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super({
      code: 'USER_NOT_FOUND',
      message: `User with identifier ${identifier} not found!`,
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' })
  }
}

export class AccountLockedException extends DomainException {
  constructor(lockedUntil: string) {
    super({
      code: 'ACCOUNT_LOCKED',
      message: `Account is locked due to too many failed login attempts. Try again after ${lockedUntil}`,
      statusCode: HttpStatus.LOCKED,
    })
  }
}

export class AccountSuspendedException extends DomainException {
  constructor() {
    super({
      code: 'ACCOUNT_SUSPENDED',
      message: 'Your account has been suspended, Please contact us for help.',
      statusCode: HttpStatus.FORBIDDEN,
    })
  }
}

export class AccountInactiveException extends DomainException {
  constructor(status: UserStatus) {
    super({
      code: 'ACCOUNT_INACTIVE',
      message: `Your account is ${status}. Please contact support.`,
      statusCode: HttpStatus.FORBIDDEN,
    })
  }
}
