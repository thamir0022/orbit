import { InjectModel } from '@nestjs/mongoose'
import { Model, PipelineStage } from 'mongoose'
import { UUID } from 'mongodb'

import { ITransactionOptions } from '@/shared/application'
import { WorkspaceId } from '@/modules/workspace/domain'

import {
  FindWorkItemByWorkspaceIdAndProjectIdAndIdQueryProps,
  FindWorkItemsQueryProps,
  QuerySortOrder,
  WorkItemQueryFilterProps,
  WorkItemQueryRepository,
  WorkItemQuerySortField,
  WorkItemListQueryResult,
} from '../../../../application/ports/work-item-query-repository.port'
import { WorkItemListItemOutput } from '../../../../application/contracts/work-item-list-item.output'
import { WorkItemDocument, WorkItemModel } from '../schemas/work-item.schema'

interface WorkItemListAggregationResult {
  items: WorkItemListItemOutput[]
  metadata: Array<{
    total: number
  }>
}

/**
 * MongoDB read-side implementation for WorkItem queries.
 *
 * Returns optimized application read models instead of
 * reconstituting WorkItem domain aggregates.
 */
export class MongoWorkItemQueryRepository implements WorkItemQueryRepository {
  constructor(
    @InjectModel(WorkItemModel.name)
    private readonly workItemModel: Model<WorkItemDocument>
  ) {}

  async findMany(
    props: FindWorkItemsQueryProps,
    options?: ITransactionOptions
  ): Promise<WorkItemListQueryResult> {
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
              $project: this.buildListProjectionStage(),
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

    const [result] =
      await this.executeAggregation<WorkItemListAggregationResult>(
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

  async findByWorkspaceIdAndProjectIdAndId(
    props: FindWorkItemByWorkspaceIdAndProjectIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<WorkItemListItemOutput | null> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          workspaceId: new UUID(props.workspaceId.value),
          projectId: new UUID(props.projectId.value),
          id: new UUID(props.workItemId.value),
          deletedAt: null,
        },
      },

      ...this.buildUserEnrichmentStages(),

      {
        $project: this.buildListProjectionStage(),
      },

      {
        $limit: 1,
      },
    ]

    const [result] = await this.executeAggregation<WorkItemListItemOutput>(
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
    filters?: WorkItemQueryFilterProps
  ): Record<string, unknown> {
    const match: Record<string, unknown> = {
      workspaceId: new UUID(workspaceId.value),
      deletedAt: null,
    }

    if (!filters) {
      return match
    }

    /**
     * Project filter.
     */
    if (filters.projectId) {
      match.projectId = new UUID(filters.projectId.value)
    }

    /**
     * Team filter.
     */
    if (filters.teamId) {
      match.teamId = new UUID(filters.teamId.value)
    }

    /**
     * Sprint filter.
     */
    if (filters.sprintId) {
      match.sprintId = new UUID(filters.sprintId.value)
    }

    /**
     * Assignee filter.
     */
    if (filters.assigneeId) {
      match.assigneeId = new UUID(filters.assigneeId.value)
    }

    /**
     * Parent work item filter.
     */
    if (filters.parentId) {
      match.parentId = new UUID(filters.parentId.value)
    }

    /**
     * Single type filter.
     */
    if (filters.type) {
      match.type = filters.type
    }

    /**
     * Multiple type filter.
     *
     * Single `type` takes precedence over `types`.
     */
    if (!filters.type && filters.types?.length) {
      match.type = {
        $in: filters.types,
      }
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
     * Single priority filter.
     */
    if (filters.priority) {
      match.priority = filters.priority
    }

    /**
     * Multiple priority filter.
     *
     * Single `priority` takes precedence over `priorities`.
     */
    if (!filters.priority && filters.priorities?.length) {
      match.priority = {
        $in: filters.priorities,
      }
    }

    /**
     * Search across work item key, title, and description.
     */
    const search = filters.search?.trim()

    if (search) {
      const escapedSearch = this.escapeRegex(search)

      match.$or = [
        {
          key: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
        {
          title: {
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
     * Story point range.
     */
    const storyPoints = this.buildNumberRange(
      filters.storyPointsFrom,
      filters.storyPointsTo
    )

    if (storyPoints) {
      match.storyPoints = storyPoints
    }

    /**
     * Started-at date range.
     */
    const startedAt = this.buildDateRange(
      filters.startDateFrom,
      filters.startDateTo
    )

    if (startedAt) {
      match.startedAt = startedAt
    }

    /**
     * Due-date range.
     */
    const dueDate = this.buildDateRange(filters.dueDateFrom, filters.dueDateTo)

    if (dueDate) {
      match.dueDate = dueDate
    }

    /**
     * Completed-at date range.
     */
    const completedAt = this.buildDateRange(
      filters.completedDateFrom,
      filters.completedDateTo
    )

    if (completedAt) {
      match.completedAt = completedAt
    }

    return match
  }

  /**
   * Creates a whitelisted MongoDB sort definition.
   */
  private buildSortStage(sort?: {
    field: WorkItemQuerySortField
    order: QuerySortOrder
  }): Record<string, 1 | -1> {
    const field = sort?.field ?? 'createdAt'
    const direction: 1 | -1 = sort?.order === 'asc' ? 1 : -1

    return {
      [field]: direction,

      /**
       * Stable secondary sort.
       *
       * Prevents inconsistent pagination when multiple work items
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
   * Builds an optional numeric range.
   */
  private buildNumberRange(
    from?: number,
    to?: number
  ): Record<string, number> | undefined {
    if (from === undefined && to === undefined) {
      return undefined
    }

    const range: Record<string, number> = {}

    if (from !== undefined) {
      range.$gte = from
    }

    if (to !== undefined) {
      range.$lte = to
    }

    return range
  }

  /**
   * Enriches the read model with the user summaries required
   * by WorkItemListItemOutput.
   */
  private buildUserEnrichmentStages(): PipelineStage.FacetPipelineStage[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: 'id',
          pipeline: [
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
          localField: 'assigneeId',
          foreignField: 'id',
          pipeline: [
            {
              $project: {
                _id: 0,
                id: 1,
                displayName: 1,
                avatarUrl: 1,
              },
            },
          ],
          as: 'assigneeUser',
        },
      },

      {
        $unwind: {
          path: '$assigneeUser',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]
  }

  /**
   * Projects only the fields required by WorkItemListItemOutput.
   */
  private buildListProjectionStage(): Record<string, unknown> {
    return {
      _id: 0,

      id: 1,

      key: 1,
      number: 1,

      type: 1,
      title: 1,
      description: 1,

      acceptanceCriteria: 1,

      status: 1,
      priority: 1,

      storyPoints: 1,

      sprintId: 1,
      parentId: 1,

      assignee: {
        $cond: [
          {
            $ne: ['$assigneeUser', null],
          },
          {
            id: '$assigneeUser.id',
            displayName: '$assigneeUser.displayName',
            avatarUrl: '$assigneeUser.avatarUrl',
          },
          null,
        ],
      },

      createdBy: {
        id: '$createdByUser.id',
        displayName: '$createdByUser.displayName',
        avatarUrl: '$createdByUser.avatarUrl',
      },

      startedAt: 1,
      dueDate: 1,
      completedAt: 1,

      createdAt: 1,
      updatedAt: 1,
    }
  }

  /**
   * Executes the aggregation with optional transaction support.
   */
  private async executeAggregation<T>(
    pipeline: PipelineStage[],
    options?: ITransactionOptions
  ): Promise<T[]> {
    const aggregation = this.workItemModel.aggregate<T>(pipeline)

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
