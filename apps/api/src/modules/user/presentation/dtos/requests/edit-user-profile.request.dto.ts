import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class EditUserProfileRequest {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First Name must have atleast 2 characters' })
  @MaxLength(50, { message: 'First Name should not exceed 50 characters' })
  firstName?: string

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First Name must have atleast 2 characters' })
  @MaxLength(50, { message: 'First Name should not exceed 50 characters' })
  lastName?: string

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First Name must have atleast 2 characters' })
  @MaxLength(50, { message: 'First Name should not exceed 50 characters' })
  displayName?: string
}
