import { IsString, IsUUID, Length, Matches } from 'class-validator'

export class SignUpUserDetailsRequestDto {
  @IsString({ message: 'First Name is required.' })
  @Length(1, 20)
  firstName!: string

  @IsString({ message: 'Last Name is required.' })
  @Length(1, 20)
  lastName!: string

  @IsString({ message: 'Password is required.' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.',
  })
  password!: string

  @IsString({ message: 'Registration token is required' })
  @IsUUID(7, { message: 'Invalid registration token' })
  registrationToken!: string
}
