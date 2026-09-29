import { IBaseRepository, ITransactionOptions } from '@/shared/application'

import { WorkspaceId } from '@/modules/workspace/domain'

import { WorkItem } from '../../domain/entities/work-item.entity'
import { WorkItemId } from '../../domain/value-objects/work-item-id.vo'
import { ProjectId } from '@/modules/project/domain'

export interface FindWorkItemByWorkspaceIdAndIdProps {
  readonly workspaceId: WorkspaceId
  readonly workItemId: WorkItemId
}

export interface FindWorkItemByWorkspaceIdAndKeyProps {
  readonly workspaceId: WorkspaceId
  readonly key: string
}

export interface FindWorkItemByProjectIdAndNumberProps {
  readonly projectId: ProjectId
  readonly number: number
}

export interface FindWorkItemsByWorkspaceIdAndParentIdProps {
  readonly workspaceId: WorkspaceId
  readonly parentId: WorkItemId
}

export interface WorkItemRepository extends IBaseRepository<
  WorkItem,
  WorkItemId
> {
  /**
   * Finds a work item within the specified workspace.
   */
  findByWorkspaceIdAndId(
    props: FindWorkItemByWorkspaceIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<WorkItem | null>

  /**
   * Finds a work item by its human-readable key within a workspace.
   */
  findByWorkspaceIdAndKey(
    props: FindWorkItemByWorkspaceIdAndKeyProps,
    options?: ITransactionOptions
  ): Promise<WorkItem | null>

  /**
   * Finds a work item by its sequential number within a project.
   */
  findByProjectIdAndNumber(
    props: FindWorkItemByProjectIdAndNumberProps,
    options?: ITransactionOptions
  ): Promise<WorkItem | null>

  /**
   * Finds child work items for a given parent work item.
   */
  findByWorkspaceIdAndParentId(
    props: FindWorkItemsByWorkspaceIdAndParentIdProps,
    options?: ITransactionOptions
  ): Promise<WorkItem[]>

  /**
   * Checks whether a work item with the given key already exists
   * within the workspace.
   */
  existsByWorkspaceIdAndKey(
    props: FindWorkItemByWorkspaceIdAndKeyProps,
    options?: ITransactionOptions
  ): Promise<boolean>

  /**
   * Checks whether a work item with the given number already exists
   * within the project.
   */
  existsByProjectIdAndNumber(
    props: FindWorkItemByProjectIdAndNumberProps,
    options?: ITransactionOptions
  ): Promise<boolean>
}

export const WORK_ITEM_REPOSITORY = Symbol('IWorkItemRepository')
