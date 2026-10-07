import { ApiProperty } from '@nestjs/swagger'

import { DocumentSummaryOutput } from '../../../../application/contracts/document-summary.output'

/**
 * HTTP response representation of a lightweight document summary.
 *
 * Exposes only the fields required for document navigation.
 */
export class DocumentSummaryResponse implements DocumentSummaryOutput {
  @ApiProperty({
    description: 'Unique identifier of the document',
    format: 'uuid',
    example: '0199a1b2-c3d4-7e89-8f01-234567890abc',
  })
  id!: string

  @ApiProperty({
    description: 'Document title',
    example: 'Authentication Architecture',
  })
  title!: string
}
