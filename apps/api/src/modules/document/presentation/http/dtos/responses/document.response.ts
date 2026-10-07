import { ApiProperty } from '@nestjs/swagger'

import { UserSummaryResponseDto } from '@/shared/presentation/dtos/responses/user-summary.response'

import { DocumentListItemOutput } from '../../../../application/contracts/document-list-item.output'
import { DocumentContent } from '../../../../domain/interfaces/document.interface'

/**
 * HTTP response representation of a document.
 *
 * This presentation model exposes document metadata while keeping
 * presentation and Swagger concerns separate from the application layer.
 */
export class DocumentResponse implements DocumentListItemOutput {
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

  @ApiProperty({
    description: 'Document content',
  })
  content!: DocumentContent

  @ApiProperty({
    description: 'User who owns the document',
    type: () => UserSummaryResponseDto,
  })
  owner!: UserSummaryResponseDto

  @ApiProperty({
    description: 'User who created the document',
    type: () => UserSummaryResponseDto,
  })
  createdBy!: UserSummaryResponseDto

  @ApiProperty({
    description: 'Timestamp when the document was created',
    format: 'date-time',
    example: '2026-10-03T08:30:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Timestamp when the document was last updated',
    format: 'date-time',
    example: '2026-10-03T10:15:00.000Z',
  })
  updatedAt!: Date
}
