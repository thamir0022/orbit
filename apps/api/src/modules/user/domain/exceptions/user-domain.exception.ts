import { DomainException } from '@/shared/domain'

export class EmailAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super('EMAIL_ALREADY_EXISTS', `User with email ${email} already exists`)
  }
}

export class InvalidEmailException extends DomainException {
  constructor(message: string) {
    super('INVALID_EMAIL', message)
  }
}

export class InvalidPasswordException extends DomainException {
  constructor(message: string[]) {
    super('INVALID_PASSWORD', message.join(';'))
  }
}

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super('USER_NOT_FOUND', `User with identifier ${identifier} not found!`)
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid email or password')
  }
}

export class AccountLockedException extends DomainException {
  constructor(lockedUntil: Date) {
    super(
      'ACCOUNT_LOCKED',
      `Account is locked due to too many failed login attempts. Try again after ${lockedUntil.toISOString()}`
    )
  }
}

export class AccountSuspendedException extends DomainException {
  constructor() {
    super(
      'ACCOUNT_SUSPENDED',
      'Your account has been suspended, Please contact us for help.'
    )
  }
}
