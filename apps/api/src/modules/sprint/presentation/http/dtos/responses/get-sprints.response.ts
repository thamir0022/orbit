import { ApiProperty } from '@nestjs/swagger'

import { SprintResponse } from './sprint.response'
import { GetSprintsOutput } from '@/modules/sprint/application/usecases/get-sprints/get-sprints.output'

/**
 * HTTP response returned when retrieving a paginated sprint list.
 */
export class GetSprintsResponse implements GetSprintsOutput {
  @ApiProperty({
    description: 'Sprints matching the requested filters.',
    type: () => [SprintResponse],
  })
  readonly sprints!: SprintResponse[]

  @ApiProperty({
    description: 'Total number of sprints matching the filters.',
    example: 42,
  })
  readonly total!: number

  @ApiProperty({
    description: 'Current page number.',
    example: 1,
  })
  readonly page!: number

  @ApiProperty({
    description: 'Number of sprints requested per page.',
    example: 20,
  })
  readonly limit!: number

  @ApiProperty({
    description: 'Whether another page of results is available.',
    example: true,
  })
  readonly hasNextPage!: boolean
}
