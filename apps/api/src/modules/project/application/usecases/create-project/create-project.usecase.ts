import { Inject, Injectable } from '@nestjs/common'

import { UserId } from '@/modules/user/domain'
import { Project } from '@/modules/project/domain/entities/project.entity'
import { ProjectNotFoundException } from '@/modules/project/domain/exceptions'
import { ProjectKey } from '@/modules/project/domain/value-objects/project-key.vo'
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '@/modules/workspace/application'
import { WorkspaceId } from '@/modules/workspace/domain'
import { ITransactionManager, TRANSACTION_MANAGER } from '@/shared/application'

import {
  PROJECT_COUNTER_REPOSITORY,
  ProjectCounterRepository,
} from '../../ports/project-counter-repository.port'
import {
  PROJECT_QUERY_REPOSITORY,
  ProjectQueryRepository,
} from '../../ports/project-query-repository.port'
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
} from '../../ports/project-repository.port'

import { CreateProjectInput } from './create-project.input'
import { CreateProjectOutput } from './create-project.output'
import { ICreateProjectUseCase } from './create-project.interface'
import { LeadIsNotAWorkspaceMemberException } from '../../../domain/exceptions'

@Injectable()
export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,

    @Inject(PROJECT_COUNTER_REPOSITORY)
    private readonly projectCounterRepository: ProjectCounterRepository,

    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepository: ProjectQueryRepository,

    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const actorId = UserId.create(input.actorId)

    const project = await this.transactionManager.executeTransaction(
      async (session) => {
        const number = await this.projectCounterRepository.nextNumber(
          workspaceId,
          { session }
        )

        const projectKey = ProjectKey.generate(input.name, number)

        const leadId =
          input.leadId !== undefined && input.leadId !== null
            ? UserId.create(input.leadId)
            : undefined

        if (leadId) {
          const member = await this.workspaceMemberRepository.findMember({
            workspaceId,
            memberId: leadId,
          })

          if (!member) {
            throw new LeadIsNotAWorkspaceMemberException()
          }
        }

        const project = Project.create({
          ...input,
          workspaceId,
          key: projectKey,
          leadId,
          createdBy: actorId,
        })

        await this.projectRepository.save(project, { session })

        return project
      }
    )

    const result = await this.projectQueryRepository.findByWorkspaceIdAndId({
      workspaceId: project.workspaceId,
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
