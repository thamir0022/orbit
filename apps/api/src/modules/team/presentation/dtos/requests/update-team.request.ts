import { Transform } from 'class-transformer'
import { TeamStatus } from '../../../domain/enums/team-status.enum'
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value

export class UpdateTeamRequest {
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'Team name must be at least 2 characters',
  })
  @MaxLength(100, {
    message: 'Team name must not exceed 100 characters',
  })
  readonly name?: string

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

  @IsOptional()
  @IsEnum(TeamStatus, { message: 'Invalid status' })
  readonly status?: TeamStatus
}
