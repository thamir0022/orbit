import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator'
import { AttachmentTargetType } from '@/modules/file/domain'
import { FileUploadPurpose } from '@/modules/file/application/ports/file-upload-policy.port'

/** Public upload intent; neither workspace ID nor storage keys are accepted from clients. */
export class InitiateUploadRequest {
  @ApiProperty({ enum: ['user', 'workspace'] })
  @IsEnum(['user', 'workspace'])
  scope!: 'user' | 'workspace'

  @ApiProperty({ enum: FileUploadPurpose })
  @IsEnum(FileUploadPurpose)
  purpose!: FileUploadPurpose

  @ApiProperty({ example: 'bug-screenshot.png', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  originalName!: string

  @ApiProperty({ example: 'image/png' })
  @IsString()
  @MaxLength(127)
  @Matches(/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i)
  mimeType!: string

  @ApiProperty({ example: 1829012, minimum: 1, maximum: 104857600 })
  @IsInt()
  @Min(1)
  @Max(104857600)
  sizeBytes!: number

  @ApiPropertyOptional({ enum: AttachmentTargetType })
  @IsOptional()
  @IsEnum(AttachmentTargetType)
  targetType?: AttachmentTargetType

  @ApiPropertyOptional({
    description: 'UUIDv7 of a proposed attachment target',
  })
  @ValidateIf(
    (dto: InitiateUploadRequest) =>
      dto.targetType !== undefined || dto.targetId !== undefined
  )
  @IsUUID('7')
  targetId?: string
}
