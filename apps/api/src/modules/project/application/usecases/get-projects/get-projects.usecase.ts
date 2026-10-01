import { Inject, Injectable } from '@nestjs/common'

import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'

import {
  PROJECT_QUERY_REPOSITORY,
  ProjectQueryRepository,
} from '../../ports/project-query-repository.port'

import { GetProjectsInput } from './get-projects.input'
import { GetProjectsOutput } from './get-projects.output'
import { IGetProjectsUseCase } from './get-projects.interface'

/**
 * Retrieves projects using the optimized query-side repository.
 *
 * The use case is responsible for translating application input
 * into query parameters. Read optimization remains inside the
 * query repository.
 */
@Injectable()
export class GetProjectsUseCase implements IGetProjectsUseCase {
  constructor(
    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepository: ProjectQueryRepository
  ) {}

  async execute(input: GetProjectsInput): Promise<GetProjectsOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const leadId = input.leadId ? UserId.create(input.leadId) : undefined

    const result = await this.projectQueryRepository.findMany({
      workspaceId,

      filters: {
        type: input.type,
        types: input.types,

        stage: input.stage,
        stages: input.stages,

        priority: input.priority,
        priorities: input.priorities,

        status: input.status,
        statuses: input.statuses,

        leadId,

        search: input.search || undefined,

        startDateFrom: this.toDate(input.startDateFrom),
        startDateTo: this.toDate(input.startDateTo),

        targetEndDateFrom: this.toDate(input.targetEndDateFrom),
        targetEndDateTo: this.toDate(input.targetEndDateTo),
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
      projects: result.items,
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
