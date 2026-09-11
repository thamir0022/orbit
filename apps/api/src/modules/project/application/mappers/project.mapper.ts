import { type ProjectDocument } from '../../infrastructure/schemas/project.schema'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { Project } from '../../domain/entities/project.entity'
import { ProjectProps } from '../../domain/interfaces'
import {
  ProjectAvatar,
  ProjectDescription,
  ProjectId,
  ProjectKey,
  ProjectName,
  ProjectProgress,
  ProjectResource,
} from '../../domain/value-objects'
import { ProjectDto } from '../model/project.dto'

/**
 * Project Mapper
 * Transforms between domain entities and persistence models.
 */
export class ProjectMapper {
  /**
   * Map domain entity to persistence model
   */
  static toPersistence(project: Project): Partial<ProjectDocument> {
    return {
      id: project.id.value,

      workspaceId: project.workspaceId.value,

      name: project.name.value,

      key: project.key.value,

      description: project.description?.value,

      resources:
        project.resources?.map((resource) => ({
          name: resource.name,
          url: resource.url,
        })) ?? [],

      avatarUrl: project.avatarUrl?.value,

      startDate: project.startDate,

      targetEndDate: project.targetEndDate,

      type: project.type,

      priority: project.priority,

      leadId: project.leadId?.value,

      status: project.status,

      progress: project.progress.value,

      createdBy: project.createdBy.value,

      createdAt: project.createdAt,

      updatedAt: project.updatedAt,
    }
  }

  /**
   * Map persistence model to domain entity
   */
  static toDomain(document: ProjectDocument): Project {
    const props: ProjectProps = {
      id: ProjectId.fromString(document.id),

      workspaceId: WorkspaceId.fromString(document.workspaceId),

      name: ProjectName.create(document.name),

      key: ProjectKey.create(document.key),

      description: document.description
        ? ProjectDescription.create(document.description)
        : undefined,

      resources:
        document.resources?.map((resource) =>
          ProjectResource.create({
            name: resource.name,
            url: resource.url,
          })
        ) ?? [],

      avatar: document.avatarUrl
        ? ProjectAvatar.create(document.avatarUrl)
        : undefined,

      startDate: document.startDate,

      targetEndDate: document.targetEndDate,

      type: document.type,

      priority: document.priority,

      leadId: document.leadId ? UserId.fromString(document.leadId) : undefined,

      status: document.status,

      progress: ProjectProgress.create(document.progress),

      createdBy: UserId.fromString(document.createdBy),

      createdAt: document.createdAt,

      updatedAt: document.updatedAt,
    }

    return Project.reconstitute(props)
  }

  /**
   * Map domain entity to raw data
   */
  static toOutputDto(project: Project): ProjectDto {
    return {
      id: project.projectId.value,

      workspaceId: project.workspaceId.value,

      name: project.name.value,

      key: project.key.value,

      description: project.description?.value,

      resources:
        project.resources?.map((resource) => ({
          name: resource.name,
          url: resource.url,
        })) ?? [],

      avatarUrl: project.avatarUrl?.value,

      startDate: project.startDate,

      targetEndDate: project.targetEndDate,

      type: project.type,

      priority: project.priority,

      leadId: project.leadId?.value,

      status: project.status,

      progress: project.progress.value,

      createdBy: project.createdBy.value,

      createdAt: project.createdAt,

      updatedAt: project.updatedAt,
    }
  }
}
