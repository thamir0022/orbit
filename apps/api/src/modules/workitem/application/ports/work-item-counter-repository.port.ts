import { ITransactionOptions } from '@/shared/application'

import { ProjectId } from '@/modules/project/domain'

/**
 * Allocates sequential work item numbers within a project.
 *
 * Implementations must guarantee that each successful allocation
 * returns a unique number for the specified project.
 */
export interface WorkItemCounterRepository {
  /**
   * Atomically increments the project counter and returns
   * the newly allocated work item number.
   *
   * When the counter does not exist, it is created starting
   * from zero and the first allocated number is one.
   */
  nextNumber(
    projectId: ProjectId,
    options?: ITransactionOptions
  ): Promise<number>
}

export const WORK_ITEM_COUNTER_REPOSITORY = Symbol('WorkItemCounterRepository')
