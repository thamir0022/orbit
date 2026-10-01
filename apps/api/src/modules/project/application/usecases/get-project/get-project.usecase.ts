import { Inject, Injectable } from '@nestjs/common'

import { WorkspaceId } from '@/modules/workspace/domain'
import { ProjectId } from '@/modules/project/domain'
import { ProjectNotFoundException } from '@/modules/project/domain/exceptions'

import {
  PROJECT_QUERY_REPOSITORY,
  ProjectQueryRepository,
} from '../../ports/project-query-repository.port'

import { GetProjectInput } from './get-project.input'
import { GetProjectOutput } from './get-project.output'
import { IGetProjectUseCase } from './get-project.interface'

/**
 * Retrieves a single project using the optimized query-side repository.
 */
@Injectable()
export class GetProjectUseCase implements IGetProjectUseCase {
  constructor(
    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepository: ProjectQueryRepository
  ) {}

  async execute(input: GetProjectInput): Promise<GetProjectOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const projectId = ProjectId.create(input.projectId)

    const project = await this.projectQueryRepository.findByWorkspaceIdAndId({
      workspaceId,
      projectId,
    })

    if (!project) {
      throw new ProjectNotFoundException()
    }

    return {
      project,
    }
  }
}
