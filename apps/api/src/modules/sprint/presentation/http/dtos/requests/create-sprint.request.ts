import { trim } from '@/shared/utils'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * Trims string input and normalizes repeated whitespace.
 *
 * Empty strings are converted to undefined so optional fields
 * are treated consistently by the application layer.
 */
const normalizeString = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value
  }

  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')

  return normalized || undefined
}

/**
 * Converts a valid date input into a Date instance.
 *
 * Invalid values are left untouched so class-validator can report
 * the validation error instead of silently accepting them.
 */
const transformDate = ({ value }: { value: unknown }): unknown => {
  if (value instanceof Date) {
    return value
  }

  if (typeof value !== 'string' || !value.trim()) {
    return value
  }

  const date = new Date(value.trim())

  return Number.isNaN(date.getTime()) ? value : date
}

export class CreateSprintRequest {
  @ApiProperty({
    description: 'Team that owns the sprint',
    example: 'ABC-A1B2C3D4',
  })
  @Transform(trim)
  @Matches(/^[A-Z0-9]{3}-[A-F0-9]{8}$/, {
    message: 'Team key must be in the format ABC-A1B2C3D4',
  })
  readonly teamKey!: string

  @ApiProperty({
    description: 'Sprint name',
    minLength: 1,
    maxLength: 120,
    example: 'Authentication & Onboarding',
  })
  @Transform(normalizeString)
  @IsString({
    message: 'Sprint name must be a string',
  })
  @IsNotEmpty({
    message: 'Sprint name is required',
  })
  @MinLength(1, {
    message: 'Sprint name must be at least 1 character',
  })
  @MaxLength(120, {
    message: 'Sprint name must not exceed 120 characters',
  })
  readonly name!: string

  @ApiPropertyOptional({
    description: 'Short objective or outcome the sprint aims to achieve',
    type: String,
    nullable: true,
    maxLength: 500,
    example: 'Complete the new authentication and onboarding flow.',
  })
  @Transform(normalizeString)
  // Planning permits an empty goal until the sprint is started.
  @IsOptional()
  @IsString({
    message: 'Sprint goal must be a string',
  })
  @MaxLength(500, {
    message: 'Sprint goal must not exceed 500 characters',
  })
  readonly goal?: string | null

  @ApiPropertyOptional({
    description: 'Additional sprint context or notes',
    type: String,
    nullable: true,
    maxLength: 5000,
    example:
      'Focus on the new sign-in, workspace selection, and onboarding experience.',
  })
  @Transform(normalizeString)
  @IsOptional()
  @IsString({
    message: 'Sprint description must be a string',
  })
  @MaxLength(5000, {
    message: 'Sprint description must not exceed 5000 characters',
  })
  readonly description?: string | null

  @ApiProperty({
    description: 'Sprint start date and time in ISO 8601 format',
    format: 'date-time',
    example: '2026-10-01T09:00:00.000Z',
  })
  @Transform(transformDate)
  @IsDate({
    message: 'Sprint start date must be a valid date',
  })
  readonly startDate!: Date

  @ApiProperty({
    description: 'Sprint end date and time in ISO 8601 format',
    format: 'date-time',
    example: '2026-10-14T17:00:00.000Z',
  })
  @Transform(transformDate)
  @IsDate({
    message: 'Sprint end date must be a valid date',
  })
  readonly endDate!: Date
}
