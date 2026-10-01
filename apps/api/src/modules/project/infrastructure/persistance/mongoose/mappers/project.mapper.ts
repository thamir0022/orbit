import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { Project } from '../../../../domain/entities/project.entity'
import { ProjectProps } from '../../../../domain/interfaces/project.props'
import { ProjectId } from '../../../../domain/value-objects/project-id.vo'
import { ProjectKey } from '../../../../domain/value-objects/project-key.vo'

import { ProjectDocument } from '../schemas/project.schema'

/**
 * Maps between the Project domain entity and persistence model.
 */
export class ProjectMapper {
  /**
   * Maps a domain entity to its persistence representation.
   */
  static toPersistence(project: Project): Partial<ProjectDocument> {
    return {
      id: project.projectId.value,

      workspaceId: project.workspaceId.value,

      name: project.name,

      key: project.key.value,

      description: project.description,

      avatarUrl: project.avatarUrl,

      type: project.type,

      stage: project.stage,

      priority: project.priority,

      leadId: project.leadId?.value,

      status: project.status,

      startDate: project.startDate,

      targetEndDate: project.targetEndDate,

      createdBy: project.createdBy.value,

      createdAt: project.createdAt,

      updatedAt: project.updatedAt,

      deletedAt: project.deletedAt ?? null,

      deletedBy: project.deletedBy?.value ?? null,
    }
  }

  /**
   * Maps a persistence model to a domain entity.
   */
  static toDomain(document: ProjectDocument): Project {
    const props: ProjectProps = {
      id: ProjectId.fromString(document.id),

      workspaceId: WorkspaceId.fromString(document.workspaceId),

      name: document.name,

      key: ProjectKey.create(document.key),

      description: document.description,

      avatarUrl: document.avatarUrl,

      type: document.type,

      stage: document.stage,

      priority: document.priority,

      leadId: document.leadId ? UserId.fromString(document.leadId) : undefined,

      status: document.status,

      startDate: document.startDate,

      targetEndDate: document.targetEndDate,

      createdBy: UserId.fromString(document.createdBy),

      createdAt: document.createdAt,

      updatedAt: document.updatedAt,

      deletedAt: document.deletedAt ?? null,

      deletedBy: document.deletedBy
        ? UserId.fromString(document.deletedBy)
        : null,
    }

    return Project.reconstitute(props)
  }
}
