import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator'
import { WorkItemStatus } from '../../../../domain/enums/work-item-status.enum'
import { CreateTeamStoryRequest } from './create-team-story.request'

export class UpdateTeamStoryRequest extends PartialType(
  OmitType(CreateTeamStoryRequest, ['projectId', 'description'] as const),
  { skipNullProperties: false }
) {
  @ApiPropertyOptional({ maxLength: 5000, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  readonly description?: string | null

  @ApiPropertyOptional({ enum: WorkItemStatus })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(WorkItemStatus)
  readonly status?: WorkItemStatus

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly completedAt?: Date | null
}
