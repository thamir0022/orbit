import { trim } from '@/shared/utils'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsString,
  IsUUID,
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
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abd',
  })
  @Transform(trim)
  @IsUUID('7', {
    message: 'Team ID must be a valid UUID v7',
  })
  readonly teamId!: string

  @ApiProperty({
    description: 'Sprint name',
    minLength: 2,
    maxLength: 100,
    example: 'Authentication & Onboarding',
  })
  @Transform(normalizeString)
  @IsString({
    message: 'Sprint name must be a string',
  })
  @IsNotEmpty({
    message: 'Sprint name is required',
  })
  @MinLength(2, {
    message: 'Sprint name must be at least 2 characters',
  })
  @MaxLength(100, {
    message: 'Sprint name must not exceed 100 characters',
  })
  readonly name!: string

  @ApiPropertyOptional({
    description: 'Short objective or outcome the sprint aims to achieve',
    maxLength: 300,
    example: 'Complete the new authentication and onboarding flow.',
  })
  @Transform(normalizeString)
  @IsString({
    message: 'Sprint goal must be a string',
  })
  @MaxLength(300, {
    message: 'Sprint goal must not exceed 300 characters',
  })
  readonly goal?: string

  @ApiPropertyOptional({
    description: 'Additional sprint context or notes',
    maxLength: 2000,
    example:
      'Focus on the new sign-in, workspace selection, and onboarding experience.',
  })
  @Transform(normalizeString)
  @IsString({
    message: 'Sprint description must be a string',
  })
  @MaxLength(2000, {
    message: 'Sprint description must not exceed 2000 characters',
  })
  readonly description?: string

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
