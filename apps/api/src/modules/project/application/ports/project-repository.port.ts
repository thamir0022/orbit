import { IBaseRepository, ITransactionOptions } from '@/shared/application'

import { WorkspaceId } from '@/modules/workspace/domain'

import { Project } from '../../domain/entities/project.entity'
import { ProjectId } from '../../domain/value-objects/project-id.vo'

export interface FindProjectByWorkspaceIdAndKeyProps {
  readonly workspaceId: WorkspaceId
  readonly key: string
}

export interface ProjectRepository extends IBaseRepository<Project, ProjectId> {
  /**
   * Finds a project by its human-readable key within a workspace.
   */
  findByWorkspaceIdAndKey(
    props: FindProjectByWorkspaceIdAndKeyProps,
    options?: ITransactionOptions
  ): Promise<Project | null>
}

export const PROJECT_REPOSITORY = Symbol('ProjectRepository')
