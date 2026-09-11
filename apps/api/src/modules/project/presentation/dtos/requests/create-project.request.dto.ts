import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'

import { ProjectPriority, ProjectType } from '@/modules/project/domain/enums'

export class ProjectResourceDto {
  @IsString()
  @MaxLength(100)
  readonly name!: string

  @IsUrl({
    require_protocol: true,
  })
  @MaxLength(2048)
  readonly url!: string
}

export class CreateProjectRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  readonly name!: string

  @IsString()
  @Length(2, 10)
  @Matches(/^[A-Z][A-Z0-9]*$/, {
    message:
      'Project key must start with a letter and contain only uppercase letters and numbers.',
  })
  readonly key!: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly description?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProjectResourceDto)
  readonly resources?: ProjectResourceDto[]

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
  @IsEnum(ProjectPriority)
  readonly priority?: ProjectPriority

  @IsOptional()
  @IsUUID('4')
  readonly leadId?: string
}
