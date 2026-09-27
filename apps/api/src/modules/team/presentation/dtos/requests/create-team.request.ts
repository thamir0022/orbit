import { ApiProperty } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value

export class CreateTeamRequest {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({
    message: 'Team name is required',
  })
  @MinLength(2, {
    message: 'Team name must be at least 2 characters',
  })
  @MaxLength(100, {
    message: 'Team name must not exceed 100 characters',
  })
  readonly name!: string

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Description must not exceed 500 characters',
  })
  readonly description?: string

  @Transform(trim)
  @IsOptional()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      message: 'Avatar URL must be a valid HTTP or HTTPS URL',
    }
  )
  @MaxLength(2048, {
    message: 'Avatar URL must not exceed 2048 characters',
  })
  readonly avatarUrl?: string

  @Transform(trim)
  @IsOptional()
  @IsUUID('7', {
    message: 'Invalid lead id',
  })
  readonly leadId?: string

  @ApiProperty({
    description: 'Member IDs to add to the team',
    type: [String],
    format: 'uuid',
    example: [
      '0192f8c4-7a1b-7c32-8f4d-123456789abc',
      '0192f8c4-7a1b-7c32-8f4d-123456789abd',
    ],
  })
  @Transform(({ value }: TransformFnParams): unknown => {
    const input: unknown = value

    if (!Array.isArray(input)) return input

    return input.map((id: unknown) => (typeof id === 'string' ? id.trim() : id))
  })
  @IsArray({
    message: 'Member IDs must be an array',
  })
  @ArrayMinSize(1, {
    message: 'At least one member ID is required',
  })
  @ArrayMaxSize(100, {
    message: 'You can add at most 100 members at a time',
  })
  @ArrayUnique({
    message: 'Member IDs must be unique',
  })
  @IsUUID('7', {
    each: true,
    message: 'Each member ID must be a valid UUID v7',
  })
  readonly memberIds!: string[]
}
