import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
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
  @MaxLength(63)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message:
      'Subdomain must contain only lowercase letters, numbers, and hyphens',
  })
  subdomain: string

  @ApiProperty({
    description: 'The UUID V7 ID of the user who owns this organization',
    example: '019bb645-034a-76df-89de-cec0b9023767',
  })
  @IsUUID('7', { message: 'Owner ID must be an UU' })
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
