import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

/**
 * Validated query parameters for the notification inbox.
 *
 * - Defaults to 20 notifications per page.
 * - Enforces a maximum page size of 100.
 * - Accepts an opaque pagination cursor and optional unread filter.
 */
export class GetNotificationsQuery {
  @ApiPropertyOptional({
    description: 'Maximum notifications to return.',
    minimum: 1,
    maximum: 100,
    default: 20,
    type: Number,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @ApiPropertyOptional({
    description: 'Opaque cursor returned by the previous page.',
    maxLength: 512,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  cursor?: string

  @ApiPropertyOptional({
    description: 'When true, return only unread notifications.',
    enum: ['true', 'false'],
    example: 'true',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  unread?: 'true' | 'false'
}
