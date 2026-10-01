import { ApiProperty } from '@nestjs/swagger'

import { GetProjectsOutput } from '@/modules/project/application/usecases/get-projects/get-projects.output'

import { ProjectResponse } from './project.response'

/**
 * HTTP response returned when retrieving a paginated project list.
 */
export class GetProjectsResponse implements GetProjectsOutput {
  @ApiProperty({
    description: 'Projects matching the requested filters.',
    type: () => [ProjectResponse],
  })
  readonly projects!: ProjectResponse[]

  @ApiProperty({
    description: 'Total number of projects matching the filters.',
    example: 42,
  })
  readonly total!: number

  @ApiProperty({
    description: 'Current page number.',
    example: 1,
  })
  readonly page!: number

  @ApiProperty({
    description: 'Number of projects requested per page.',
    example: 20,
  })
  readonly limit!: number

  @ApiProperty({
    description: 'Whether another page of results is available.',
    example: true,
  })
  readonly hasNextPage!: boolean
}
