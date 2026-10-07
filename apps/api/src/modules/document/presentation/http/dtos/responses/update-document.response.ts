import { ApiProperty } from '@nestjs/swagger'

import { DocumentResponse } from '../../dtos/responses/document.response'

/**
 * HTTP response returned after successfully updating a document.
 */
export class UpdateDocumentResponse {
  @ApiProperty({
    description: 'The updated document.',
    type: () => DocumentResponse,
  })
  readonly document!: DocumentResponse
}
