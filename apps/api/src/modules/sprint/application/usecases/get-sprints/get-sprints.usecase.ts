import { Inject, Injectable } from '@nestjs/common'

import { WorkspaceId } from '@/modules/workspace/domain'

import {
  SPRINT_QUERY_REPOSITORY,
  SprintQueryRepository,
} from '../../ports/sprint-query-repository.port'

import { TeamId } from '@/modules/team/domain'

import { GetSprintsInput } from './get-sprints.input'
import { GetSprintsOutput } from './get-sprints.output'
import { IGetSprintsUseCase } from './get-sprints.interface'

/**
 * Retrieves sprints using the optimized query-side repository.
 *
 * The use case is responsible for translating application input
 * into query parameters. Read optimization remains inside the
 * query repository.
 */
@Injectable()
export class GetSprintsUseCase implements IGetSprintsUseCase {
  constructor(
    @Inject(SPRINT_QUERY_REPOSITORY)
    private readonly sprintQueryRepository: SprintQueryRepository
  ) {}

  async execute(input: GetSprintsInput): Promise<GetSprintsOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const teamId = input.teamId ? TeamId.create(input.teamId) : undefined

    const result = await this.sprintQueryRepository.findMany({
      workspaceId,

      filters: {
        teamId,

        status: input.status,
        statuses: input.statuses,

        search: input.search?.trim() || undefined,

        startDateFrom: this.toDate(input.startDateFrom),
        startDateTo: this.toDate(input.startDateTo),

        endDateFrom: this.toDate(input.endDateFrom),
        endDateTo: this.toDate(input.endDateTo),
      },

      pagination: {
        page: input.page ?? 1,
        limit: input.limit ?? 20,
      },

      sort: input.sortField
        ? {
            field: input.sortField,
            order: input.sortOrder ?? 'desc',
          }
        : undefined,
    })

    return {
      sprints: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
    }
  }

  /**
   * Converts an application date value into a Date instance.
   */
  private toDate(value?: Date | string): Date | undefined {
    if (!value) {
      return undefined
    }

    if (value instanceof Date) {
      return value
    }

    return new Date(value)
  }
}
