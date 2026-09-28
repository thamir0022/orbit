import { ApiProperty } from '@nestjs/swagger'

import { SprintResponse } from './sprint.response'

/**
 * HTTP response returned after successfully updating a sprint.
 */
export class UpdateSprintResponse {
  @ApiProperty({
    description: 'The updated sprint.',
    type: () => SprintResponse,
  })
  readonly sprint!: SprintResponse
}
