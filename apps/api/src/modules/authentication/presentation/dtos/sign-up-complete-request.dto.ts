import { CompanySize } from '../../../../shared/application/contracts/company-size'
import { CompanyType } from '../../../../shared/application/contracts/company-type'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator'

export class SignUpCompleteRequestDto {
  @IsString({ message: 'Workspace name must be a string' })
  @IsNotEmpty({ message: 'Workspace name is required' })
  @MaxLength(100, { message: 'Workspace name is too long' })
  name!: string

  @IsString({ message: 'Subdomain is required' })
  @Matches(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, {
    message:
      'Invalid subdomain, subdomain must contain only lowercase letters, numbers, and hyphens',
  })
  @MaxLength(50, { message: 'Slug is too long' })
  slug!: string

  @IsOptional()
  @IsEnum(CompanySize, { message: 'Invalid company size' })
  companySize?: CompanySize

  @IsOptional()
  @IsEnum(CompanyType, { message: 'Invalid company type' })
  companyType?: CompanyType

  @IsUUID('7', { message: 'Invalid registration token' })
  registrationToken!: string
}
