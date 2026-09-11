import { IsNotEmpty, IsUUID, Matches } from 'class-validator'

export class PasswordResetConfirmRequestDto {
  @IsNotEmpty({ message: 'Reset Token is required' })
  @IsUUID(7, { message: 'Invalid reset token' })
  resetToken!: string

  @IsNotEmpty({ message: 'New password is required' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.',
  })
  newPassword!: string
}
