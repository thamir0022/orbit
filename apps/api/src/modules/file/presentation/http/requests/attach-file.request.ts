import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import {
  AttachmentPlacement,
  AttachmentTargetType,
} from '@/modules/file/domain'

/** Public attachment link request; workspace ID is taken from authentication. */
export class AttachFileRequest {
  @ApiProperty() @IsUUID('7') fileId!: string
  @ApiProperty({ enum: AttachmentTargetType })
  @IsEnum(AttachmentTargetType)
  targetType!: AttachmentTargetType
  @ApiProperty() @IsUUID('7') targetId!: string
  @ApiPropertyOptional({ enum: AttachmentPlacement })
  @IsOptional()
  @IsEnum(AttachmentPlacement)
  placement?: AttachmentPlacement
  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string
}
