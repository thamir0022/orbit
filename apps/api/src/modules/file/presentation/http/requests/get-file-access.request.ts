import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsUUID } from 'class-validator'

/** An optional explicit attachment context for permission inheritance. */
export class GetFileAccessRequest {
  @ApiPropertyOptional({
    description: 'The attachment used to authorize this download',
  })
  @IsOptional()
  @IsUUID('7')
  attachmentId?: string

  @ApiPropertyOptional({
    enum: ['attachment', 'inline'],
    default: 'attachment',
  })
  @IsOptional()
  @IsIn(['attachment', 'inline'])
  disposition?: 'attachment' | 'inline'
}
