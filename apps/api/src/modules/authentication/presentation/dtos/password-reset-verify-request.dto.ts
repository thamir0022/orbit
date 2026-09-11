import { IsEmail, IsNotEmpty, Matches } from 'class-validator'

export class PasswordResetVerifyRequestDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email!: string

  @IsNotEmpty({ message: 'OTP is required' })
  @Matches(/^\d{6}$/, { message: 'Invalid OTP, OTP must be a 6 digit number' })
  otp!: string
}
