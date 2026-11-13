import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator'

export class UpdateAttachmentRequest {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  displayName!: string

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  revision!: number
}
