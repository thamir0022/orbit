import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator'
import { CompanySize, CompanyType } from '../../domain/enums'

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'The name of the organization',
    example: 'Acme Corp',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string

  @ApiProperty({
    description: 'Unique subdomain for the organization',
    example: 'acme',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Subdomain must contain only lowercase letters, numbers, and hyphens',
  })
  subdomain: string

  @ApiProperty({
    description: 'The UUID of the user who owns this organization',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('7', { message: 'Owner ID must be an UUID' })
  @IsNotEmpty()
  ownerId: string

  @ApiPropertyOptional({
    description: 'Size of the company',
    enum: CompanySize,
    enumName: 'CompanySize', // Helps Swagger generate a named schema
    example: CompanySize.MEDIUM_51_100,
  })
  @IsOptional()
  @IsEnum(CompanySize, {
    message: `Company Size must be one of: ${Object.values(CompanySize).join(', ')}`,
  })
  companySize?: CompanySize

  @ApiPropertyOptional({
    description: 'Type of the company',
    enum: CompanyType,
    enumName: 'CompanyType',
    example: CompanyType.STARTUP,
  })
  @IsOptional()
  @IsEnum(CompanyType, {
    message: `Company Type must be one of: ${Object.values(CompanyType).join(', ')}`,
  })
  companyType?: CompanyType
}
