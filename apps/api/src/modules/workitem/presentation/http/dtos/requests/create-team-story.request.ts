import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator'
import { WorkItemPriority } from '../../../../domain/enums/work-item-priority.enum'

export class CreateTeamStoryRequest {
  @ApiProperty({ minLength: 1, maxLength: 250 })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  readonly title!: string

  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsUUID('7')
  readonly projectId?: string

  @ApiPropertyOptional({ maxLength: 5000 })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(5000)
  readonly description?: string

  @ApiPropertyOptional({ type: [String], maxItems: 50 })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  readonly acceptanceCriteria?: readonly string[]

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('7')
  readonly parentId?: string | null

  @ApiPropertyOptional({ enum: WorkItemPriority, nullable: true })
  @IsOptional()
  @IsEnum(WorkItemPriority)
  readonly priority?: WorkItemPriority | null

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('7')
  readonly assigneeId?: string | null

  @ApiPropertyOptional({ minimum: 1, maximum: 1000, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  readonly storyPoints?: number | null

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly startedAt?: Date | null

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly dueDate?: Date | null
}
