import { Inject, Injectable } from '@nestjs/common'

import { Project } from '@/modules/project/domain/entities/project.entity'
import { ProjectKey } from '@/modules/project/domain/value-objects/project-key.vo'
import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'

import { ProjectNotFoundException } from '../../../domain/exceptions'

import {
  PROJECT_QUERY_REPOSITORY,
  ProjectQueryRepository,
} from '../../ports/project-query-repository.port'
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
} from '../../ports/project-repository.port'
import {
  PROJECT_COUNTER_REPOSITORY,
  ProjectCounterRepository,
} from '../../ports/project-counter-repository.port'

import { ITransactionManager, TRANSACTION_MANAGER } from '@/shared/application'

import { CreateProjectInput } from './create-project.input'
import { ICreateProjectUseCase } from './create-project.interface'
import { CreateProjectOutput } from './create-project.output'

@Injectable()
export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,

    @Inject(PROJECT_COUNTER_REPOSITORY)
    private readonly projectCounterRepository: ProjectCounterRepository,

    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepository: ProjectQueryRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManger: ITransactionManager
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    const { workspaceId: workspaceIdValue, ...projectProps } = input

    // Convert primitive input values into domain value objects.
    const workspaceId = WorkspaceId.create(workspaceIdValue)

    const project = await this.transactionManger.executeTransaction(
      async (session) => {
        const number = await this.projectCounterRepository.nextNumber(
          workspaceId,
          {
            session,
          }
        )

        const projectKey = ProjectKey.generate(projectProps.name, number)

        const leadId = UserId.create(projectProps.leadId)
        const actorId = UserId.create(projectProps.actorId)

        const project = Project.create({
          ...projectProps,

          workspaceId,
          leadId,
          key: projectKey,

          createdBy: actorId,
        })

        await this.projectRepository.save(project)

        return project
      }
    )

    const result = await this.projectQueryRepository.findByWorkspaceIdAndId({
      workspaceId: project.workspaceId,
      projectId: project.projectId,
    })

    if (!result) {
      throw new ProjectNotFoundException()
    }

    return {
      project: result,
    }
  }
}
