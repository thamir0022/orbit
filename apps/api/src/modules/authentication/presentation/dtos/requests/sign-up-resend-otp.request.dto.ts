import { IsEmail, IsNotEmpty } from 'class-validator'

export class SignUpResendOtpRequest {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  readonly email!: string
}
