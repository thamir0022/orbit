import { CompanySize, CompanyType } from '@/modules/organization/domain'
import { type ClientInfo } from '../interfaces/auth.interface'
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
  @IsString({ message: 'Organization name must be a string' })
  @IsNotEmpty({ message: 'Organization name is required' })
  @MaxLength(100, { message: 'Organization name is too long' })
  name!: string

  @IsString({ message: 'Subdomain is required' })
  @Matches(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, {
    message:
      'Invalid subdomain, subdomain must contain only lowercase letters, numbers, and hyphens',
  })
  @MaxLength(50, { message: 'Subdomain is too long' })
  subdomain!: string

  @IsOptional()
  @IsEnum(CompanySize, { message: 'Invalid company size' })
  companySize?: CompanySize

  @IsOptional()
  @IsEnum(CompanyType, { message: 'Invalid company type' })
  companyType?: CompanyType

  @IsUUID('7', { message: 'Invalid registration token' })
  registrationToken!: string

  @IsOptional()
  clientInfo!: ClientInfo
}
