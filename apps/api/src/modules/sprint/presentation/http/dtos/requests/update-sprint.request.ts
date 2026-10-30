import { trim } from '@/shared/utils'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'

export class UpdateSprintRequest {
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

  @ApiPropertyOptional({
    description: 'Updated sprint name.',
    minLength: 1,
    maxLength: 120,
    example: 'Authentication & Onboarding v2',
  })
  @Transform(({ value }): unknown => {
    if (typeof value !== 'string') {
      return value
    }

    const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')

    return normalized
  })
  // Omission leaves required fields unchanged; null is invalid.
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString({
    message: 'Sprint name must be a string',
  })
  @MinLength(1, {
    message: 'Sprint name must be at least 1 character',
  })
  @MaxLength(120, {
    message: 'Sprint name must not exceed 120 characters',
  })
  readonly name?: string

  @ApiPropertyOptional({
    description: 'Updated sprint goal.',
    type: String,
    nullable: true,
    maxLength: 500,
    example: 'Complete the authentication and onboarding experience.',
  })
  @Transform(({ value }): unknown => {
    if (typeof value !== 'string') {
      return value
    }

    const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')

    return normalized
  })
  @IsOptional()
  @IsString({
    message: 'Sprint goal must be a string',
  })
  @MaxLength(500, {
    message: 'Sprint goal must not exceed 500 characters',
  })
  readonly goal?: string | null

  @ApiPropertyOptional({
    description: 'Updated sprint description.',
    type: String,
    nullable: true,
    maxLength: 5000,
    example: 'Focus on sign-in, workspace selection, and onboarding.',
  })
  @Transform(({ value }): unknown => {
    if (typeof value !== 'string') {
      return value
    }

    const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')

    return normalized
  })
  @IsOptional()
  @IsString({
    message: 'Sprint description must be a string',
  })
  @MaxLength(5000, {
    message: 'Sprint description must not exceed 5000 characters',
  })
  readonly description?: string | null

  @ApiPropertyOptional({
    description: 'Updated sprint start date and time in ISO 8601 format.',
    format: 'date-time',
    example: '2026-10-02T09:00:00.000Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsDate({
    message: 'Start date must be a valid date',
  })
  readonly startDate?: Date

  @ApiPropertyOptional({
    description: 'Updated sprint end date and time in ISO 8601 format.',
    format: 'date-time',
    example: '2026-10-16T17:00:00.000Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsDate({
    message: 'End date must be a valid date',
  })
  readonly endDate?: Date
}
