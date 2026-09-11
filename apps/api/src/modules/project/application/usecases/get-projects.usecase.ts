import { Inject } from '@nestjs/common'
import { GetProjectsInput, GetProjectsOutput } from '../dtos'
import { IGetProjectsUseCase } from './get-projects.interface'
import {
  type IProjectRepository,
  PROJECT_REPOSITORY,
} from '../repositories/project.repository.interface'
import { WorkspaceId } from '@/modules/workspace/domain'
import { ProjectKey, ProjectName } from '../../domain/value-objects'
import { ProjectMapper } from '../mappers/project.mapper'

export class GetProjectsUseCase implements IGetProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository
  ) {}

  async execute(input: GetProjectsInput): Promise<GetProjectsOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const projects = await this.projectRepository.findAllWorkspaceProjects(
      workspaceId,
      {
        key: input.key ? ProjectKey.create(input.key) : undefined,
        name: input.name ? ProjectName.create(input.name) : undefined,
        status: input.status,
        priority: input.priority,
        type: input.type,
      }
    )

    return {
      projects: projects.map((project) => ProjectMapper.toOutputDto(project)),
    }
  }
}
