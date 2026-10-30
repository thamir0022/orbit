import { ITransactionOptions } from '@/shared/application'
import { SprintWorkItem } from '../../domain/entities/sprint-work-item.entity'
import { SprintItemSnapshot } from '../../domain/interfaces/sprint-snapshot.interface'

export interface SprintScope {
  workspaceId: string
  teamId: string
  sprintId: string
}

/** Defines persistence and scoped work-item reads for sprint assignments. */

export interface SprintWorkItemRepository {
  findPage(
    scope: SprintScope,
    page: number,
    limit: number
  ): Promise<{ items: SprintWorkItem[]; total: number }>

  findBySprint(
    scope: SprintScope,
    options?: ITransactionOptions
  ): Promise<SprintWorkItem[]>

  findCurrent(
    workspaceId: string,
    workItemId: string,
    options?: ITransactionOptions
  ): Promise<SprintWorkItem | null>

  findLatest(
    workspaceId: string,
    workItemId: string,
    options?: ITransactionOptions
  ): Promise<SprintWorkItem | null>

  readItems(
    workspaceId: string,
    teamId: string,
    ids: string[],
    options?: ITransactionOptions
  ): Promise<SprintItemSnapshot[]>

  saveMany(
    items: SprintWorkItem[],
    options?: ITransactionOptions
  ): Promise<void>
}
export const SPRINT_WORK_ITEM_REPOSITORY = Symbol('SprintWorkItemRepository')
