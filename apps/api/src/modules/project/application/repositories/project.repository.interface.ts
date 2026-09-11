import { IBaseRepository } from '@/shared/application'
import { ProjectId, ProjectKey, ProjectName } from '../../domain/value-objects'
import { Project } from '../../domain/entities/project.entity'
import { WorkspaceId } from '@/modules/workspace/domain'
import { ProjectPriority, ProjectStatus, ProjectType } from '../../domain/enums'

export interface FindByKeyQuery {
  workspaceId: WorkspaceId
  key: ProjectKey
}

export interface FindAllWorkspaceProjectsQuery {
  name?: ProjectName
  key?: ProjectKey
  type?: ProjectType
  priority?: ProjectPriority
  status?: ProjectStatus
}

export interface IProjectRepository extends IBaseRepository<
  Project,
  ProjectId
> {
  findByKey(query: FindByKeyQuery): Promise<Project | null>
  findAllWorkspaceProjects(
    workspaceId: WorkspaceId,
    query: FindAllWorkspaceProjectsQuery
  ): Promise<Project[]>
}

export const PROJECT_REPOSITORY = Symbol('IProjectRepository')
