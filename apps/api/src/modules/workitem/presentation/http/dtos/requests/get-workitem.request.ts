import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Route parameters for retrieving a single work item.
 */
export class GetWorkItemRequest {
  @ApiProperty({
    description: 'Unique human-readable work item key within the workspace.',
    example: 'ORB-001-001',
    minLength: 7,
    maxLength: 32,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim().toUpperCase() : value
  )
  @IsNotEmpty({
    message: 'Work item key is required',
  })
  @MinLength(7, {
    message: 'Work item key must be at least 7 characters',
  })
  @MaxLength(32, {
    message: 'Work item key must not exceed 32 characters',
  })
  @Matches(/^[A-Z0-9]{3}-\d+-\d+$/, {
    message: 'Work item key must be a valid work item key',
  })
  readonly key!: string
}
