import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
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

import { ProjectPriority } from '../../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../../domain/enums/project-stage.enum'
import { ProjectStatus } from '../../../domain/enums/project-status.enum'
import { ProjectType } from '../../../domain/enums/project-type.enum'

/**
 * HTTP request body for updating a project.
 */
export class UpdateProjectRequest {
  @ApiPropertyOptional({
    description: 'Project name',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 char long' })
  @MaxLength(100, { message: 'Name must be at most 100 char long' })
  readonly name?: string

  @ApiPropertyOptional({
    description: 'Project description',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a valid string' })
  @MaxLength(1000, {
    message: 'Description must be at most 1000 char long',
  })
  readonly description?: string

  @ApiPropertyOptional({
    description: 'Project avatar URL',
  })
  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'Avatar URL must be a valid URL' }
  )
  @MaxLength(2048)
  readonly avatarUrl?: string

  @ApiPropertyOptional({
    description: 'Project type.',
    enum: ProjectType,
    example: ProjectType.PRODUCT,
  })
  @IsOptional()
  @IsEnum(ProjectType, {
    message: 'Type must be a valid project type',
  })
  readonly type?: ProjectType

  @ApiPropertyOptional({
    description: 'Project lifecycle stage.',
    enum: ProjectStage,
    example: ProjectStage.PROPOSAL,
  })
  @IsOptional()
  @IsEnum(ProjectStage, {
    message: 'Stage must be a valid project stage',
  })
  readonly stage?: ProjectStage

  @ApiPropertyOptional({
    description: 'Project priority.',
    enum: ProjectPriority,
    example: ProjectPriority.NO_PRIORITY,
  })
  @IsOptional()
  @IsEnum(ProjectPriority, {
    message: 'Priority must be a valid project priority',
  })
  readonly priority?: ProjectPriority

  @ApiPropertyOptional({
    description: 'Project lifecycle status.',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: 'Status must be a valid project status',
  })
  readonly status?: ProjectStatus

  @ApiPropertyOptional({
    description:
      'Project lead user ID. Pass null to remove the current project lead.',
    format: 'uuid',
    nullable: true,
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
  })
  @IsOptional()
  @IsUUID('7', {
    message: 'Lead ID must be a valid UUID v7',
  })
  readonly leadId?: string | null

  @ApiPropertyOptional({
    description:
      'Project start date and time. Pass null to remove the current start date.',
    format: 'date-time',
    nullable: true,
    example: '2026-10-01T09:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: 'Start date must be a valid date',
  })
  readonly startDate?: Date | null

  @ApiPropertyOptional({
    description:
      'Target project completion date and time. Pass null to remove the current target end date.',
    format: 'date-time',
    nullable: true,
    example: '2026-12-31T17:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: 'Target end date must be a valid date',
  })
  readonly targetEndDate?: Date | null
}
