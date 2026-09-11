import { Result, ValueObject } from '@/shared/domain'
import { randomInt } from 'crypto'

interface OtpProps {
  value: string
}

export class Otp extends ValueObject<OtpProps> {
  private static readonly OTP_LENGTH = 6
  private static readonly OTP_REGEX = /^\d{6}$/

  private constructor(props: OtpProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  private static isValidFormat(otp: string): boolean {
    return this.OTP_REGEX.test(otp)
  }

  /**
   * Creates an Otp instance
   */
  static create(otp: string): Result<Otp, string> {
    if (!this.isValidFormat(otp)) {
      return Result.fail(`OTP must be exactly ${this.OTP_LENGTH} digits`)
    }

    return Result.ok(new Otp({ value: otp }))
  }

  /**
   * Generates a new random 6-digit OTP instance
   */
  static generate(): Otp {
    const otp = randomInt(100000, 1000000).toString()

    return new Otp({ value: otp })
  }
}
