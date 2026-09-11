import { CompanySize, CompanyType } from '@/shared/application/contracts'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateWorkspaceRequest {
  @ApiProperty({
    description: 'The name of the workspace',
    example: 'Acme Corp',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string

  @ApiProperty({
    description: 'Unique subdomain for the workspace',
    example: 'acme',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(63)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string

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
