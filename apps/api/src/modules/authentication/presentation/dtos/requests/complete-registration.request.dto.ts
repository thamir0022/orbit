import { IsString, IsUUID, Length, Matches } from 'class-validator'

export class CompleteRegistrationRequest {
  @IsString({ message: 'Registration token is required' })
  @IsUUID('7', { message: 'Invalid registration token' })
  readonly registrationToken!: string

  @IsString({ message: 'Invitaion token is required' })
  readonly invitationToken!: string

  @IsString({ message: 'First name is required' })
  @Length(2, 20)
  readonly firstName!: string

  @IsString({ message: 'Last name is required' })
  @Length(2, 20)
  readonly lastName!: string

  @IsString({ message: 'Password is required.' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.',
  })
  readonly password!: string
}
