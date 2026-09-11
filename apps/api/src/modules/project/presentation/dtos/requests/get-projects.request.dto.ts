import {
  ProjectPriority,
  ProjectStatus,
  ProjectType,
} from '@/modules/project/domain/enums'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class GetProjectsRequest {
  @IsOptional()
  @IsString()
  readonly name?: string

  @IsOptional()
  @IsString()
  readonly key?: string

  @IsOptional()
  @IsEnum(ProjectType)
  readonly type?: ProjectType

  @IsOptional()
  @IsEnum(ProjectPriority)
  readonly priority?: ProjectPriority

  @IsOptional()
  @IsEnum(ProjectStatus)
  readonly status?: ProjectStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit: number = 20
}
