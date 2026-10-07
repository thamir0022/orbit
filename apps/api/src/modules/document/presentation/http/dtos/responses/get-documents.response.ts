import { ApiProperty } from '@nestjs/swagger'

import { DocumentSummaryResponse } from './document-summary.response'

/**
 * HTTP response returned when retrieving the user's document list.
 */
export class GetDocumentsResponse {
  @ApiProperty({
    description: 'Documents available to the authenticated user.',
    type: () => DocumentSummaryResponse,
    isArray: true,
  })
  readonly documents!: readonly DocumentSummaryResponse[]
}
