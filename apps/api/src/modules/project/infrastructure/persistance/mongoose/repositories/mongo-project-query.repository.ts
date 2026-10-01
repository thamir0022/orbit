import { InjectModel } from '@nestjs/mongoose'
import { Model, PipelineStage } from 'mongoose'
import { UUID } from 'mongodb'

import { ITransactionOptions } from '@/shared/application'
import { WorkspaceId } from '@/modules/workspace/domain'

import { ProjectListItemOutput } from '../../../../application/contracts/project-list-item.output'
import {
  FindProjectByWorkspaceIdAndIdQueryProps,
  FindProjectsQueryProps,
  ProjectQueryFilterProps,
  ProjectQueryRepository,
  ProjectQuerySortField,
  ProjectSortProps,
  ProjectListQueryResult,
} from '../../../../application/ports/project-query-repository.port'
import { ProjectDocument, ProjectModel } from '../schemas/project.schema'

interface ProjectListAggregationResult {
  items: ProjectListItemOutput[]
  metadata: Array<{
    total: number
  }>
}

/**
 * MongoDB read-side implementation for Project queries.
 *
 * Returns optimized application read models instead of
 * reconstituting Project domain aggregates.
 */
export class MongoProjectQueryRepository implements ProjectQueryRepository {
  constructor(
    @InjectModel(ProjectModel.name)
    private readonly projectModel: Model<ProjectDocument>
  ) {}

  async findMany(
    props: FindProjectsQueryProps,
    options?: ITransactionOptions
  ): Promise<ProjectListQueryResult> {
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
                key: 1,
                description: 1,
                avatarUrl: 1,

                type: 1,
                stage: 1,
                priority: 1,
                status: 1,

                lead: {
                  $cond: [
                    {
                      $ne: ['$leadUser', null],
                    },
                    {
                      id: '$leadUser.id',
                      displayName: '$leadUser.displayName',
                      avatarUrl: '$leadUser.avatarUrl',
                    },
                    null,
                  ],
                },

                createdBy: {
                  id: '$createdByUser.id',
                  displayName: '$createdByUser.displayName',
                  avatarUrl: '$createdByUser.avatarUrl',
                },

                startDate: {
                  $ifNull: ['$startDate', null],
                },

                targetEndDate: {
                  $ifNull: ['$targetEndDate', null],
                },

                createdAt: 1,
                updatedAt: 1,
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

    const [result] =
      await this.executeAggregation<ProjectListAggregationResult>(
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

  async findByWorkspaceIdAndId(
    props: FindProjectByWorkspaceIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<ProjectListItemOutput | null> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          workspaceId: new UUID(props.workspaceId.value),
          id: new UUID(props.projectId.value),
          deletedAt: null,
        },
      },

      ...this.buildUserEnrichmentStages(),

      {
        $project: {
          _id: 0,

          id: 1,

          name: 1,
          key: 1,
          description: 1,
          avatarUrl: 1,

          type: 1,
          stage: 1,
          priority: 1,
          status: 1,

          lead: {
            $cond: [
              {
                $ne: ['$leadUser', null],
              },
              {
                id: '$leadUser.id',
                displayName: '$leadUser.displayName',
                avatarUrl: '$leadUser.avatarUrl',
              },
              null,
            ],
          },

          createdBy: {
            id: '$createdByUser.id',
            displayName: '$createdByUser.displayName',
            avatarUrl: '$createdByUser.avatarUrl',
          },

          startDate: {
            $ifNull: ['$startDate', null],
          },

          targetEndDate: {
            $ifNull: ['$targetEndDate', null],
          },

          createdAt: 1,
          updatedAt: 1,
        },
      },

      {
        $limit: 1,
      },
    ]

    const [result] = await this.executeAggregation<ProjectListItemOutput>(
      pipeline,
      options
    )

    return result ?? null
  }

  /**
   * Builds the tenant-scoped and soft-delete-aware filter
   * used by the project read model.
   */
  private buildMatchStage(
    workspaceId: WorkspaceId,
    filters?: ProjectQueryFilterProps
  ): Record<string, unknown> {
    const match: Record<string, unknown> = {
      workspaceId: new UUID(workspaceId.value),
      deletedAt: null,
    }

    if (!filters) {
      return match
    }

    // -------------------------------------------------------------------------
    // Type filters
    // -------------------------------------------------------------------------

    if (filters.type) {
      match.type = filters.type
    } else if (filters.types?.length) {
      match.type = {
        $in: filters.types,
      }
    }

    // -------------------------------------------------------------------------
    // Stage filters
    // -------------------------------------------------------------------------

    if (filters.stage) {
      match.stage = filters.stage
    } else if (filters.stages?.length) {
      match.stage = {
        $in: filters.stages,
      }
    }

    // -------------------------------------------------------------------------
    // Priority filters
    // -------------------------------------------------------------------------

    if (filters.priority) {
      match.priority = filters.priority
    } else if (filters.priorities?.length) {
      match.priority = {
        $in: filters.priorities,
      }
    }

    // -------------------------------------------------------------------------
    // Status filters
    // -------------------------------------------------------------------------

    if (filters.status) {
      match.status = filters.status
    } else if (filters.statuses?.length) {
      match.status = {
        $in: filters.statuses,
      }
    }

    // -------------------------------------------------------------------------
    // Lead filter
    // -------------------------------------------------------------------------

    if (filters.leadId) {
      match.leadId = new UUID(filters.leadId.value)
    }

    // -------------------------------------------------------------------------
    // Search
    // -------------------------------------------------------------------------

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
          key: {
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

    // -------------------------------------------------------------------------
    // Start date range
    // -------------------------------------------------------------------------

    const startDate = this.buildDateRange(
      filters.startDateFrom,
      filters.startDateTo
    )

    if (startDate) {
      match.startDate = startDate
    }

    // -------------------------------------------------------------------------
    // Target end date range
    // -------------------------------------------------------------------------

    const targetEndDate = this.buildDateRange(
      filters.targetEndDateFrom,
      filters.targetEndDateTo
    )

    if (targetEndDate) {
      match.targetEndDate = targetEndDate
    }

    return match
  }

  /**
   * Creates a whitelisted MongoDB sort definition.
   *
   * The field comes from the application-level union type,
   * preventing arbitrary MongoDB fields from being exposed.
   */
  private buildSortStage(sort?: ProjectSortProps): Record<string, 1 | -1> {
    const field: ProjectQuerySortField = sort?.field ?? 'createdAt'

    const direction: 1 | -1 = sort?.order === 'asc' ? 1 : -1

    return {
      [field]: direction,

      /**
       * Stable secondary sort.
       *
       * Prevents inconsistent pagination when multiple projects
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
   *
   * Pagination is applied before these lookups so that user joins
   * only run for the projects returned on the current page.
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
            leadId: '$leadId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$id', '$$leadId'],
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
          as: 'leadUser',
        },
      },

      {
        $unwind: {
          path: '$leadUser',
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
    const aggregation = this.projectModel.aggregate<T>(pipeline)

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
