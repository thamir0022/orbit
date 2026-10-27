import { TeamId } from '@/modules/team/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { ITransactionOptions } from '@/shared/application'

/**
 * Allocates sequential work item numbers within a project.
 *
 * Implementations must guarantee that each successful allocation
 * returns a unique number for the specified project.
 */
export interface WorkItemNumberAllocator {
  allocateNextNumber(
    workspaceId: WorkspaceId,
    teamId: TeamId,
    options?: ITransactionOptions
  ): Promise<number>
}

export const WORK_ITEM_NUMBER_ALLOCATOR = Symbol('WorkItemNumberAllocator')
