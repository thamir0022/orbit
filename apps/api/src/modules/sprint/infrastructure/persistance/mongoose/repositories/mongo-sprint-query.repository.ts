import { ITransactionOptions } from '@/shared/application'
import { WorkspaceId } from '@/modules/workspace/domain'
import { InjectModel } from '@nestjs/mongoose'
import { Model, PipelineStage } from 'mongoose'
import { UUID } from 'mongodb'

import {
  FindSprintByWorkspaceIdAndTeamIdAndIdQueryProps,
  FindSprintsQueryProps,
  QuerySortOrder,
  SprintQueryFilterProps,
  SprintQuerySortField,
  SprintQueryRepository,
  SprintListQueryResult,
} from '../../../../application/ports/sprint-query-repository.port'
import { SprintListItemOutput } from '../../../../application/contracts/sprint-list-item.output'
import { SprintDocument, SprintModel } from '../schemas/sprint.schema'

interface SprintListAggregationResult {
  items: SprintListItemOutput[]
  metadata: Array<{
    total: number
  }>
}

/**
 * MongoDB read-side implementation for Sprint queries.
 *
 * Returns optimized application read models instead of
 * reconstituting Sprint domain aggregates.
 */
export class MongoSprintQueryRepository implements SprintQueryRepository {
  constructor(
    @InjectModel(SprintModel.name)
    private readonly sprintModel: Model<SprintDocument>
  ) {}

  async findMany(
    props: FindSprintsQueryProps,
    options?: ITransactionOptions
  ): Promise<SprintListQueryResult> {
    const { workspaceId, filters, pagination, sort } = props

    const page = Math.max(1, pagination.page)
    const limit = Math.min(Math.max(1, pagination.limit), 100)
    const skip = (page - 1) * limit

    const pipeline: PipelineStage[] = [
      {
        $match: this.buildMatchStage(workspaceId, filters),
      },

      {
        $facet: {
          items: [
            {
              $sort: this.buildSortStage(sort),
            },

            {
              $skip: skip,
            },

            {
              $limit: limit,
            },

            ...this.buildUserEnrichmentStages(),

            {
              $project: {
                _id: 0,

                id: 1,

                name: 1,
                goal: 1,
                description: 1,

                status: 1,

                startDate: 1,
                endDate: 1,

                committedPoints: 1,
                completedPoints: 1,

                startedAt: 1,
                completedAt: 1,

                cancelledAt: 1,

                createdAt: 1,
                updatedAt: 1,

                createdBy: {
                  id: '$createdByUser.id',
                  displayName: '$createdByUser.displayName',
                  avatarUrl: '$createdByUser.avatarUrl',
                },

                cancelledBy: {
                  $cond: [
                    {
                      $ne: ['$cancelledByUser', null],
                    },
                    {
                      id: '$cancelledByUser.id',
                      displayName: '$cancelledByUser.displayName',
                      avatarUrl: '$cancelledByUser.avatarUrl',
                    },
                    null,
                  ],
                },
              },
            },
          ],

          metadata: [
            {
              $count: 'total',
            },
          ],
        },
      },
    ]

    const [result] = await this.executeAggregation<SprintListAggregationResult>(
      pipeline,
      options
    )

    const total = result?.metadata[0]?.total ?? 0

    return {
      items: result?.items ?? [],
      total,
      page,
      limit,
      hasNextPage: skip + limit < total,
    }
  }

  async findByWorkspaceIdAndTeamIdAndId(
    props: FindSprintByWorkspaceIdAndTeamIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<SprintListItemOutput | null> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          workspaceId: new UUID(props.workspaceId.value),
          teamId: new UUID(props.teamId.value),
          id: new UUID(props.sprintId.value),
        },
      },

      ...this.buildUserEnrichmentStages(),

      {
        $project: {
          _id: 0,

          id: 1,

          name: 1,
          goal: 1,
          description: 1,

          status: 1,

          startDate: 1,
          endDate: 1,

          committedPoints: 1,
          completedPoints: 1,

          startedAt: 1,
          completedAt: 1,

          cancelledAt: 1,

          createdAt: 1,
          updatedAt: 1,

          createdBy: {
            id: '$createdByUser.id',
            displayName: '$createdByUser.displayName',
            avatarUrl: '$createdByUser.avatarUrl',
          },

          cancelledBy: {
            $cond: [
              {
                $ne: ['$cancelledByUser', null],
              },
              {
                id: '$cancelledByUser.id',
                displayName: '$cancelledByUser.displayName',
                avatarUrl: '$cancelledByUser.avatarUrl',
              },
              null,
            ],
          },
        },
      },

      {
        $limit: 1,
      },
    ]

    const [result] = await this.executeAggregation<SprintListItemOutput>(
      pipeline,
      options
    )

    return result ?? null
  }

  /**
   * Builds the tenant-scoped filter used by the read model.
   */
  private buildMatchStage(
    workspaceId: WorkspaceId,
    filters?: SprintQueryFilterProps
  ): Record<string, unknown> {
    const match: Record<string, unknown> = {
      workspaceId: new UUID(workspaceId.value),
    }

    if (!filters) {
      return match
    }

    /**
     * Team filter.
     */
    if (filters.teamId) {
      match.teamId = new UUID(filters.teamId.value)
    }

    /**
     * Single status filter.
     */
    if (filters.status) {
      match.status = filters.status
    }

    /**
     * Multiple status filter.
     *
     * Single `status` takes precedence over `statuses`.
     */
    if (!filters.status && filters.statuses?.length) {
      match.status = {
        $in: filters.statuses,
      }
    }

    /**
     * Search across sprint name, goal, and description.
     */
    const search = filters.search?.trim()

    if (search) {
      const escapedSearch = this.escapeRegex(search)

      match.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
        {
          goal: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
      ]
    }

    /**
     * Sprint start-date range.
     */
    const startDate = this.buildDateRange(
      filters.startDateFrom,
      filters.startDateTo
    )

    if (startDate) {
      match.startDate = startDate
    }

    /**
     * Sprint end-date range.
     */
    const endDate = this.buildDateRange(filters.endDateFrom, filters.endDateTo)

    if (endDate) {
      match.endDate = endDate
    }

    return match
  }

  /**
   * Creates a whitelisted MongoDB sort definition.
   */
  private buildSortStage(sort?: {
    field: SprintQuerySortField
    order: QuerySortOrder
  }): Record<string, 1 | -1> {
    const field = sort?.field ?? 'startDate'
    const direction: 1 | -1 = sort?.order === 'asc' ? 1 : -1

    return {
      [field]: direction,

      /**
       * Stable secondary sort.
       *
       * Prevents inconsistent pagination when multiple sprints
       * share the same primary sort value.
       */
      id: 1,
    }
  }

  /**
   * Builds an optional date range.
   */
  private buildDateRange(
    from?: Date,
    to?: Date
  ): Record<string, Date> | undefined {
    if (!from && !to) {
      return undefined
    }

    const range: Record<string, Date> = {}

    if (from) {
      range.$gte = from
    }

    if (to) {
      range.$lte = to
    }

    return range
  }

  /**
   * Adds only the fields required by UserSummaryOutput.
   */
  private buildUserEnrichmentStages(): PipelineStage.FacetPipelineStage[] {
    return [
      {
        $lookup: {
          from: 'users',
          let: {
            createdById: '$createdBy',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$id', '$$createdById'],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: 1,
                displayName: 1,
                avatarUrl: 1,
              },
            },
          ],
          as: 'createdByUser',
        },
      },

      {
        $unwind: {
          path: '$createdByUser',
          preserveNullAndEmptyArrays: false,
        },
      },

      {
        $lookup: {
          from: 'users',
          let: {
            cancelledById: '$cancelledBy',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$id', '$$cancelledById'],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: 1,
                displayName: 1,
                avatarUrl: 1,
              },
            },
          ],
          as: 'cancelledByUser',
        },
      },

      {
        $unwind: {
          path: '$cancelledByUser',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]
  }

  /**
   * Executes the aggregation with optional transaction support.
   */
  private async executeAggregation<T>(
    pipeline: PipelineStage[],
    options?: ITransactionOptions
  ): Promise<T[]> {
    const aggregation = this.sprintModel.aggregate<T>(pipeline)

    if (options?.session) {
      aggregation.session(options.session)
    }

    return aggregation.exec()
  }

  /**
   * Prevents user input from becoming an unintended regular expression.
   */
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}
