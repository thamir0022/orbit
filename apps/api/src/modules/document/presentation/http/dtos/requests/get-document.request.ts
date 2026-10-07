import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsUUID } from 'class-validator'

/**
 * HTTP request parameters used to retrieve a private document by its identifier.
 */
export class GetDocumentRequest {
  @ApiProperty({
    description: 'Unique identifier of the document',
    format: 'uuid',
    example: '0199a1b2-c3d4-7e89-8f01-234567890abc',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsUUID('7', {
    message: 'Document ID must be a valid UUID v7',
  })
  readonly documentId!: string
}
