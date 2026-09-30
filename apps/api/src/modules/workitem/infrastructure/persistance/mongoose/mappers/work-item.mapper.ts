import { ProjectId } from '@/modules/project/domain'
import { SprintId } from '@/modules/sprint/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { WorkItem } from '../../../../domain/entities/work-item.entity'
import { WorkItemId } from '../../../../domain/value-objects/work-item-id.vo'
import { WorkItemDocument } from '../schemas/work-item.schema'
import { WorkItemKey } from '@/modules/workitem/domain/value-objects/work-item-key.vo'

export class WorkItemMapper {
  static toDomain(document: WorkItemDocument): WorkItem {
    return WorkItem.reconstitute({
      id: WorkItemId.fromString(document.id),

      workspaceId: WorkspaceId.fromString(document.workspaceId),
      projectId: ProjectId.fromString(document.projectId),
      teamId: TeamId.fromString(document.teamId),

      type: document.type,

      key: WorkItemKey.create(document.key),
      number: document.number,

      title: document.title,
      description: document.description,

      acceptanceCriteria: [...document.acceptanceCriteria],

      parentId: document.parentId
        ? WorkItemId.fromString(document.parentId)
        : null,

      status: document.status,
      priority: document.priority,

      sprintId: document.sprintId
        ? SprintId.fromString(document.sprintId)
        : null,

      assigneeId: document.assigneeId
        ? UserId.fromString(document.assigneeId)
        : null,

      createdBy: UserId.fromString(document.createdBy),

      storyPoints: document.storyPoints,

      startedAt: document.startedAt,
      dueDate: document.dueDate,
      completedAt: document.completedAt,

      createdAt: document.createdAt,
      updatedAt: document.updatedAt,

      deletedAt: document.deletedAt ?? null,
    })
  }

  static toPersistence(workItem: WorkItem): Partial<WorkItemDocument> {
    return {
      id: workItem.id.value,

      workspaceId: workItem.workspaceId.value,
      projectId: workItem.projectId.value,
      teamId: workItem.teamId.value,

      type: workItem.type,

      key: workItem.key.value,
      number: workItem.number,

      title: workItem.title,
      description: workItem.description,

      acceptanceCriteria: [...workItem.acceptanceCriteria],

      parentId: workItem.parentId ? workItem.parentId.value : null,

      status: workItem.status,
      priority: workItem.priority,

      sprintId: workItem.sprintId ? workItem.sprintId.value : null,

      assigneeId: workItem.assigneeId ? workItem.assigneeId.value : null,

      createdBy: workItem.createdBy.value,

      storyPoints: workItem.storyPoints,

      startedAt: workItem.startedAt,
      dueDate: workItem.dueDate,
      completedAt: workItem.completedAt,

      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,

      deletedAt: workItem.deletedAt,
    }
  }
}
