import { ApiProperty } from '@nestjs/swagger'
import { Transform, type TransformFnParams } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator'

export class AddTeamMembersRequest {
  @ApiProperty({
    description: 'User IDs to add to the team',
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
    message: 'User IDs must be an array',
  })
  @ArrayMinSize(1, {
    message: 'At least one user ID is required',
  })
  @ArrayMaxSize(100, {
    message: 'You can add at most 100 users at a time',
  })
  @ArrayUnique({
    message: 'User IDs must be unique',
  })
  @IsUUID('7', {
    each: true,
    message: 'Each user ID must be a valid UUID v7',
  })
  readonly userIds!: string[]
}
