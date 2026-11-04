import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsUUID, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { AttachmentTargetType } from '@/modules/file/domain'

/** Query for one workspace business target. */
export class ListAttachmentsRequest {
  @ApiProperty({ enum: AttachmentTargetType })
  @IsEnum(AttachmentTargetType)
  targetType!: AttachmentTargetType
  @ApiProperty() @IsUUID('7') targetId!: string
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50
}
