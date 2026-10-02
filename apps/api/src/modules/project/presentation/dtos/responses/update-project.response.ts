import { ApiProperty } from '@nestjs/swagger'

import { UpdateProjectOutput } from '@/modules/project/application/usecases/update-project/update-project.output'

import { ProjectResponse } from './project.response'

/**
 * HTTP response returned after updating a project.
 */
export class UpdateProjectResponse implements UpdateProjectOutput {
  @ApiProperty({
    description: 'Updated project.',
    type: () => ProjectResponse,
  })
  readonly project!: ProjectResponse
}
