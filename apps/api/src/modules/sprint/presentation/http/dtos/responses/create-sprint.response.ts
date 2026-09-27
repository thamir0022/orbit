import { ApiProperty } from '@nestjs/swagger'

import { SprintResponse } from './sprint.response'

/**
 * HTTP response returned after successfully creating a sprint.
 */
export class CreateSprintResponse {
  @ApiProperty({
    description: 'The newly created sprint.',
    type: () => SprintResponse,
  })
  readonly sprint!: SprintResponse
}
