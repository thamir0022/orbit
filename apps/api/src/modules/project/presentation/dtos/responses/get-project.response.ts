import { ApiProperty } from '@nestjs/swagger'

import { GetProjectOutput } from '@/modules/project/application/usecases/get-project/get-project.output'

import { ProjectResponse } from './project.response'

/**
 * HTTP response returned when retrieving a single project.
 */
export class GetProjectResponse implements GetProjectOutput {
  @ApiProperty({
    description: 'Project matching the requested ID.',
    type: () => ProjectResponse,
  })
  readonly project!: ProjectResponse
}
