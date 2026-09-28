import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator'

const SORT_ORDERS = ['asc', 'desc'] as const

type SortOrder = (typeof SORT_ORDERS)[number]

/**
 * Base request contract for paginated and searchable resources.
 *
 * Resource-specific filters and sort fields should be defined
 * by the concrete request DTO.
 */
export abstract class PaginatedSearchRequest {
  @ApiPropertyOptional({
    description:
      'Search term used to filter results. The supported searchable fields depend on the resource.',
    maxLength: 100,
    example: 'authentication',
  })
  @Transform(({ value }): unknown => {
    const input: unknown = value

    if (typeof input !== 'string') {
      return input
    }

    const normalized = input.normalize('NFKC').trim().replace(/\s+/g, ' ')

    return normalized || undefined
  })
  @IsOptional()
  @IsString({
    message: 'Search must be a string',
  })
  @MaxLength(100, {
    message: 'Search must not exceed 100 characters',
  })
  readonly search?: string

  @ApiPropertyOptional({
    description: 'Page number.',
    minimum: 1,
    maximum: 10000,
    default: 1,
    example: 1,
  })
  @Transform(({ value }): unknown => {
    const input: unknown = value

    if (typeof input === 'number') {
      return input
    }

    if (typeof input !== 'string') {
      return input
    }

    const normalized = input.trim()

    if (!normalized) {
      return input
    }

    const parsed = Number(normalized)

    return Number.isInteger(parsed) ? parsed : input
  })
  @IsOptional()
  @IsInt({
    message: 'Page must be a whole number',
  })
  @Min(1, {
    message: 'Page must be at least 1',
  })
  @Max(10000, {
    message: 'Page must not exceed 10000',
  })
  readonly page?: number

  @ApiPropertyOptional({
    description: 'Number of results returned per page.',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @Transform(({ value }): unknown => {
    const input: unknown = value

    if (typeof input === 'number') {
      return input
    }

    if (typeof input !== 'string') {
      return input
    }

    const normalized = input.trim()

    if (!normalized) {
      return input
    }

    const parsed = Number(normalized)

    return Number.isInteger(parsed) ? parsed : input
  })
  @IsOptional()
  @IsInt({
    message: 'Limit must be a whole number',
  })
  @Min(1, {
    message: 'Limit must be at least 1',
  })
  @Max(100, {
    message: 'Limit must not exceed 100',
  })
  readonly limit?: number

  @ApiPropertyOptional({
    description: 'Sort direction.',
    enum: SORT_ORDERS,
    default: 'desc',
    example: 'desc',
  })
  @Transform(({ value }): unknown => {
    const input: unknown = value

    if (typeof input !== 'string') {
      return input
    }

    return input.trim().toLowerCase()
  })
  @IsOptional()
  @IsIn(SORT_ORDERS, {
    message: 'Sort order must be either asc or desc',
  })
  readonly sortOrder?: SortOrder
}
