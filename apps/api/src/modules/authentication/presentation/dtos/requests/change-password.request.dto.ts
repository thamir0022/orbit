import { Transform } from 'class-transformer'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator'

export class ChangePasswordRequestDto {
  @IsOptional()
  @IsString({ message: 'Current password must be a string.' })
  @IsNotEmpty({ message: 'Current password cannot be empty.' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  currentPassword?: string

  @IsString({ message: 'New password is required.' })
  @IsNotEmpty({ message: 'New password is required.' })
  @MinLength(8, {
    message: 'New password must be at least 8 characters long.',
  })
  @Matches(/[A-Z]/, {
    message: 'New password must contain at least one uppercase letter.',
  })
  @Matches(/\d/, {
    message: 'New password must contain at least one number.',
  })
  @Matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/, {
    message: 'New password must contain at least one special character.',
  })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  newPassword!: string
}
