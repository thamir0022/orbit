import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { AttachmentTargetType } from '@/modules/file/domain'

class AttachmentOrderItem {
  @ApiProperty()
  @IsUUID('7')
  id!: string

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  revision!: number
}

export class ReorderAttachmentsRequest {
  @ApiProperty({ enum: AttachmentTargetType })
  @IsEnum(AttachmentTargetType)
  targetType!: AttachmentTargetType

  @ApiProperty()
  @IsUUID('7')
  targetId!: string

  @ApiProperty({ type: [AttachmentOrderItem], maxItems: 100 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AttachmentOrderItem)
  items!: AttachmentOrderItem[]
}
