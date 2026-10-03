import { ApiProperty } from '@nestjs/swagger'

import { DocumentResponse } from './document.response'

/**
 * HTTP response returned after successfully creating a document.
 */
export class CreateDocumentResponse {
  @ApiProperty({
    description: 'The newly created document.',
    type: () => DocumentResponse,
  })
  readonly document!: DocumentResponse
}
