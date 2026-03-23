import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class InvalidRefreshTokenException extends DomainException {
  constructor(message?: string) {
    super({
      code: 'INVALID_REFRESH_TOKEN',
      message: message ?? 'Refresh token is invalid or expired',
      statusCode: HttpStatus.UNAUTHORIZED,
    })
  }
}

export class RefreshTokenNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'REFRESH_TOKEN_NOT_FOUND',
      message: 'Refresh token not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class SessionNotFoundException extends DomainException {
  constructor(sessionId: string) {
    super({
      code: 'SESSION_NOT_FOUND',
      message: `Session ${sessionId} not found or expired`,
      statusCode: HttpStatus.UNAUTHORIZED,
    })
  }
}

export class RefreshTokenMismatchException extends DomainException {
  constructor() {
    super({
      code: 'REFRESH_TOKEN_MISMATCH',
      message: 'Invalid refresh token',
      statusCode: HttpStatus.UNAUTHORIZED,
    })
  }
}

export class UserAgentMisMatchException extends DomainException {
  constructor() {
    super({
      code: 'USER_AGENT_MISMATCH',
      message: 'User agent mismatch',
      statusCode: HttpStatus.UNAUTHORIZED,
    })
  }
}

export class InvalidOtpException extends DomainException {
  constructor() {
    super({
      code: 'INVALID_OTP',
      message:
        'The verification code is invalid or has expired. Please request a new code.',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}

export class OtpAlreadySendException extends DomainException {
  constructor() {
    super({
      code: 'OTP_ALREADY_SEND',
      message: 'OTP already send, Please check your inbox.',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
    })
  }
}
export class MaxOtpRequestsExceededException extends DomainException {
  constructor() {
    super({
      code: 'MAX_OTP_REQUESTS_REACHED',
      message:
        'Maxmum OTP request reached for today, Please try again tomorrow',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}

export class SignUpSessionNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'SESSION_NOT_FOUND',
      message:
        'Your verification session has expired. Please start the registration process again.',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class InCompleteSignUpSessionException extends DomainException {
  constructor() {
    super({
      code: 'INCOMPLETE_SESSION',
      message:
        'Your sign up process is incomplete, Please enter your personal details.',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class AuthProviderMismatchException extends DomainException {
  constructor(provider: string) {
    super({
      code: 'AUTH_PROVIDER_MISMATCH',
      message: `This account was created with ${provider}. Please sign in with ${provider} or set a password first`,
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
