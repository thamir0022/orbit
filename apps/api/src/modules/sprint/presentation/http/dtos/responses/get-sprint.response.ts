import { ApiProperty } from '@nestjs/swagger'

import { SprintResponse } from './sprint.response'
import { GetSprintOutput } from '../../../../application/usecases/get-sprint/get-sprint.output'

/**
 * HTTP response returned when retrieving a single sprint.
 */
export class GetSprintResponse implements GetSprintOutput {
  @ApiProperty({
    description: 'The requested sprint.',
    type: () => SprintResponse,
  })
  readonly sprint!: SprintResponse
}
