import { Inject, Injectable } from '@nestjs/common'
import { CreateProjectInput, CreateProjectOutput } from '../dtos'
import { ICreateProjectUseCase } from './create-project.interface'
import {
  type IProjectRepository,
  PROJECT_REPOSITORY,
} from '../repositories/project.repository.interface'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  ProjectAvatar,
  ProjectDescription,
  ProjectKey,
  ProjectName,
  ProjectResource,
} from '../../domain/value-objects'
import { Project } from '../../domain/entities/project.entity'
import { ProjectPriority } from '../../domain/enums'
import { UserId } from '@/modules/user/domain'
import { ProjectMapper } from '../mappers/project.mapper'
import { ProjectAlreadyExistsException } from '../../domain/exceptions/project.exception'

@Injectable()
export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    const workspaceId = WorkspaceId.fromString(input.workspaceId)

    const key = ProjectKey.create(input.key)

    const existingProject = await this.projectRepository.findByKey({
      workspaceId,
      key,
    })

    if (existingProject) throw new ProjectAlreadyExistsException(key.value)

    const project = Project.create({
      workspaceId,

      name: ProjectName.create(input.name),

      key,

      description: input.description
        ? ProjectDescription.create(input.description)
        : undefined,

      resources:
        input.resources?.map((resource) =>
          ProjectResource.create({
            name: resource.name,
            url: resource.url,
          })
        ) ?? [],

      avatar: input.avatarUrl
        ? ProjectAvatar.create(input.avatarUrl)
        : undefined,

      startDate: input.startDate,

      targetEndDate: input.targetEndDate,

      type: input.type,

      priority: input.priority ?? ProjectPriority.MEDIUM,

      leadId: input.leadId ? UserId.fromString(input.leadId) : undefined,

      createdBy: UserId.fromString(input.createdBy),
    })

    await this.projectRepository.save(project)

    return {
      project: ProjectMapper.toOutputDto(project),
    }
  }
}
