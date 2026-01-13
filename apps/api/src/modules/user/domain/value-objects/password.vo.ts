import { ValueObject } from '@/shared/domain'
import { Result } from '@/shared/domain'

interface PasswordProps {
  value: string
  isHashed: boolean
}

/**
 * Password Value Object
 * Encapsulates password validation rules
 */
export class Password extends ValueObject<PasswordProps> {
  private static readonly MIN_LENGTH = 8
  private static readonly MAX_LENGTH = 128

  private constructor(props: PasswordProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  get isHashed(): boolean {
    return this.props.isHashed
  }

  private static validateStrength(password: string): string[] {
    const errors: string[] = []

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters`)
    }

    if (password.length > this.MAX_LENGTH) {
      errors.push(`Password must be at most ${this.MAX_LENGTH} characters`)
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return errors
  }

  static create(password: string): Result<Password, string[]> {
    const errors = this.validateStrength(password)

    if (errors.length > 0) return Result.fail(errors)

    return Result.ok(new Password({ value: password, isHashed: false }))
  }

  static fromHashed(hashedPassword: string): Password {
    return new Password({ value: hashedPassword, isHashed: true })
  }
}
