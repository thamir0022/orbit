import { ApiProperty } from '@nestjs/swagger'

import { GetWorkItemOutput } from '@/modules/workitem/application/usecases/get-workitem/get-workitem.output'

import { WorkItemResponse } from './work-item.response'

/**
 * HTTP response returned when retrieving a single work item.
 */
export class GetWorkItemResponse implements GetWorkItemOutput {
  @ApiProperty({
    description: 'Work item matching the requested key.',
    type: () => WorkItemResponse,
  })
  readonly workItem!: WorkItemResponse
}
