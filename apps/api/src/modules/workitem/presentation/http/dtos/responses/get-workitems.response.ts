import { ApiProperty } from '@nestjs/swagger'

import { GetWorkItemsOutput } from '@/modules/workitem/application/usecases/get-workitems/get-workitems.output'

import { WorkItemResponse } from './work-item.response'

/**
 * HTTP response returned when retrieving a paginated work item list.
 */
export class GetWorkItemsResponse implements GetWorkItemsOutput {
  @ApiProperty({
    description: 'Work items matching the requested filters.',
    type: () => [WorkItemResponse],
  })
  readonly workItems!: WorkItemResponse[]

  @ApiProperty({
    description: 'Total number of work items matching the filters.',
    example: 42,
  })
  readonly total!: number

  @ApiProperty({
    description: 'Current page number.',
    example: 1,
  })
  readonly page!: number

  @ApiProperty({
    description: 'Number of work items requested per page.',
    example: 20,
  })
  readonly limit!: number

  @ApiProperty({
    description: 'Whether another page of results is available.',
    example: true,
  })
  readonly hasNextPage!: boolean
}
