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
    minLength: 2,
    maxLength: 100,
    example: 'Authentication & Onboarding v2',
  })
  @Transform(({ value }): unknown => {
    if (typeof value !== 'string') {
      return value
    }

    const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')

    return normalized || undefined
  })
  @IsOptional()
  @IsString({
    message: 'Sprint name must be a string',
  })
  @MinLength(2, {
    message: 'Sprint name must be at least 2 characters',
  })
  @MaxLength(100, {
    message: 'Sprint name must not exceed 100 characters',
  })
  readonly name?: string

  @ApiPropertyOptional({
    description: 'Updated sprint goal.',
    maxLength: 300,
    example: 'Complete the authentication and onboarding experience.',
  })
  @Transform(({ value }): unknown => {
    if (typeof value !== 'string') {
      return value
    }

    const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')

    return normalized || undefined
  })
  @IsOptional()
  @IsString({
    message: 'Sprint goal must be a string',
  })
  @MaxLength(300, {
    message: 'Sprint goal must not exceed 300 characters',
  })
  readonly goal?: string

  @ApiPropertyOptional({
    description: 'Updated sprint description.',
    maxLength: 2000,
    example: 'Focus on sign-in, workspace selection, and onboarding.',
  })
  @Transform(({ value }): unknown => {
    if (typeof value !== 'string') {
      return value
    }

    const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')

    return normalized || undefined
  })
  @IsOptional()
  @IsString({
    message: 'Sprint description must be a string',
  })
  @MaxLength(2000, {
    message: 'Sprint description must not exceed 2000 characters',
  })
  readonly description?: string

  @ApiPropertyOptional({
    description: 'Updated sprint start date and time in ISO 8601 format.',
    format: 'date-time',
    example: '2026-10-02T09:00:00.000Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @IsOptional()
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
  @IsOptional()
  @IsDate({
    message: 'End date must be a valid date',
  })
  readonly endDate?: Date
}
