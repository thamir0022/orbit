import { ITransactionOptions } from '@/shared/application'

import { WorkspaceId } from '@/modules/workspace/domain'

/**
 * Allocates sequential project numbers within a workspace.
 *
 * Implementations must guarantee that every successful allocation
 * returns a unique number for the specified workspace.
 */
export interface ProjectCounterRepository {
  /**
   * Atomically increments the workspace project counter
   * and returns the newly allocated project number.
   *
   * When the counter does not exist, it is created with
   * an initial value of zero and the first allocation returns one.
   */
  nextNumber(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<number>
}

export const PROJECT_COUNTER_REPOSITORY = Symbol('ProjectCounterRepository')
