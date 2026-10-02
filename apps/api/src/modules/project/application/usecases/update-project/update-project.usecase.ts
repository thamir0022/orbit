import { Inject, Injectable } from '@nestjs/common'

import { UserId } from '@/modules/user/domain'
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '@/modules/workspace/application'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  LeadIsNotAWorkspaceMemberException,
  ProjectNotFoundException,
} from '@/modules/project/domain/exceptions'
import { ProjectKey } from '@/modules/project/domain/value-objects/project-key.vo'
import { ITransactionManager, TRANSACTION_MANAGER } from '@/shared/application'

import {
  PROJECT_QUERY_REPOSITORY,
  ProjectQueryRepository,
} from '../../ports/project-query-repository.port'
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
} from '../../ports/project-repository.port'

import { UpdateProjectInput } from './update-project.input'
import { UpdateProjectOutput } from './update-project.output'
import { IUpdateProjectUseCase } from './update-project.interface'

/**
 * Updates a project and returns its optimized read model.
 */
@Injectable()
export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,

    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepository: ProjectQueryRepository,

    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: UpdateProjectInput): Promise<UpdateProjectOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const projectKey = ProjectKey.fromString(input.key)

    const project = await this.projectRepository.findByWorkspaceIdAndKey({
      workspaceId,
      key: projectKey,
    })

    if (!project) {
      throw new ProjectNotFoundException()
    }

    let leadId: UserId | null | undefined

    if (input.leadId !== undefined) {
      if (input.leadId === null) {
        leadId = null
      } else {
        leadId = UserId.create(input.leadId)

        const member = await this.workspaceMemberRepository.findMember({
          workspaceId,
          memberId: leadId,
        })

        if (!member) {
          throw new LeadIsNotAWorkspaceMemberException()
        }
      }
    }

    await this.transactionManager.executeTransaction(async (session) => {
      project.update({
        name: input.name,
        description: input.description,
        avatarUrl: input.avatarUrl,

        type: input.type,
        stage: input.stage,
        priority: input.priority,
        status: input.status,

        leadId,
        startDate: input.startDate,
        targetEndDate: input.targetEndDate,
      })

      await this.projectRepository.save(project, { session })
    })

    const result = await this.projectQueryRepository.findByWorkspaceIdAndId({
      workspaceId,
      projectId: project.id,
    })

    if (!result) {
      throw new ProjectNotFoundException()
    }

    return {
      project: result,
    }
  }
}
