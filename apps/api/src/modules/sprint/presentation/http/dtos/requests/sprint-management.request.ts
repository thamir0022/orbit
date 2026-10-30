import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { SprintTeamRequest } from './sprint-team.request'

/** Validates lifecycle details and sprint assignment pagination. */

export class SprintReasonRequest extends SprintTeamRequest {
  @ApiPropertyOptional({
    description: 'Audit reason for the operation.',
    maxLength: 1000,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly reason?: string
}

export class CompleteSprintRequest extends SprintReasonRequest {
  @ApiPropertyOptional({
    description: 'Next planned sprint; required when unfinished work remains.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('7')
  readonly targetSprintId?: string
}

export class GetSprintWorkItemsQuery extends SprintTeamRequest {
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 10000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  readonly page: number = 1
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit: number = 20
}
