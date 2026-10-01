import { Type } from 'class-transformer'

import { ProjectPriority } from '../../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../../domain/enums/project-stage.enum'
import { ProjectType } from '../../../domain/enums/project-type.enum'

import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * Create Project Request
 */
export class CreateProjectRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  readonly name!: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly description?: string

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  @MaxLength(2048)
  readonly avatarUrl?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly startDate?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly targetEndDate?: Date

  @IsOptional()
  @IsEnum(ProjectType)
  readonly type?: ProjectType

  @IsOptional()
  @IsEnum(ProjectStage)
  readonly stage?: ProjectStage

  @IsOptional()
  @IsEnum(ProjectPriority)
  readonly priority?: ProjectPriority

  @IsOptional()
  @IsUUID('7')
  readonly leadId?: string
}
