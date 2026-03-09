import { IsEmail, Length, Matches } from 'class-validator'

export class SignUpVerifyEmailWithOtpRequestDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string

  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d+$/, { message: 'OTP must contain only numbers' })
  code!: string
}
