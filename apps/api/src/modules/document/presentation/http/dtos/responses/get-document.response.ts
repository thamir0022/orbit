import { ApiProperty } from '@nestjs/swagger'

import { DocumentResponse } from './document.response'

/**
 * HTTP response returned after successfully retrieving a document.
 */
export class GetDocumentResponse {
  @ApiProperty({
    description: 'The requested document.',
    type: () => DocumentResponse,
  })
  readonly document!: DocumentResponse
}
