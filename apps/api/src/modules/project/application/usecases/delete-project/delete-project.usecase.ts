import { Inject, Injectable } from '@nestjs/common'

import { ProjectKey } from '../../../domain/value-objects/project-key.vo'
import { ProjectNotFoundException } from '../../../domain/exceptions'

import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import {
  PROJECT_REPOSITORY,
  ProjectRepository,
} from '../../ports/project-repository.port'

import { DeleteProjectInput } from './delete-project.input'
import { IDeleteProjectUseCase } from './delete-project.interface'

/**
 * Soft-deletes a project after validating its workspace ownership.
 */
@Injectable()
export class DeleteProjectUseCase implements IDeleteProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository
  ) {}

  async execute(input: DeleteProjectInput): Promise<void> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const projectkey = ProjectKey.create(input.projectKey)
    const actorId = UserId.create(input.actorId)

    const project = await this.projectRepository.findByWorkspaceIdAndKey({
      workspaceId,
      key: projectkey,
    })

    if (!project) throw new ProjectNotFoundException()

    project.delete(actorId)

    await this.projectRepository.save(project)
  }
}
