import { ApiProperty } from '@nestjs/swagger'

import { GetWorkItemOutput } from '../../../../application/usecases/get-workitem/get-workitem.output'

import { WorkItemResponse } from './work-item.response'

/**
 * HTTP response returned after successfully updating a work item.
 */
export class UpdateWorkItemResponse implements GetWorkItemOutput {
  @ApiProperty({
    description: 'Updated work item.',
    type: () => WorkItemResponse,
  })
  readonly workItem!: WorkItemResponse
}
