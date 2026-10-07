import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, PipelineStage } from 'mongoose'
import { UUID } from 'mongodb'

import { ITransactionOptions } from '@/shared/application'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { DocumentListItemOutput } from '../../../../application/contracts/document-list-item.output'
import {
  DocumentQueryRepository,
  FindDocumentByWorkspaceIdAndOwnerIdAndIdQueryProps,
} from '../../../../application/ports/document-query-repository.port'
import { DocumentDocument, DocumentModel } from '../schemas/document.schema'
import { DocumentSummaryOutput } from '@/modules/document/application/contracts/document-summary.output'

/**
 * MongoDB read-side implementation for Document queries.
 *
 * Returns optimized document projections instead of reconstituting
 * Document domain aggregates.
 */
@Injectable()
export class MongoDocumentQueryRepository implements DocumentQueryRepository {
  constructor(
    @InjectModel(DocumentModel.name)
    private readonly documentModel: Model<DocumentDocument>
  ) {}

  /**
   * Finds all active documents owned by a user within a workspace.
   *
   * Results are ordered by most recently created document first with
   * a stable identifier as a secondary sort field.
   */
  async findByWorkspaceIdAndOwnerId(
    workspaceId: WorkspaceId,
    ownerId: UserId,
    options?: ITransactionOptions
  ): Promise<readonly DocumentListItemOutput[]> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          workspaceId: new UUID(workspaceId.value),
          ownerId: new UUID(ownerId.value),
          deletedAt: null,
        },
      },

      {
        $sort: {
          createdAt: -1,
          id: 1,
        },
      },

      ...this.buildUserEnrichmentStages(),

      {
        $project: {
          _id: 0,

          id: 1,
          title: 1,

          owner: {
            id: '$ownerUser.id',
            displayName: '$ownerUser.displayName',
            avatarUrl: '$ownerUser.avatarUrl',
          },

          createdBy: {
            id: '$createdByUser.id',
            displayName: '$createdByUser.displayName',
            avatarUrl: '$createdByUser.avatarUrl',
          },

          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]

    return this.executeAggregation<DocumentListItemOutput>(pipeline, options)
  }

  /**
   * Finds a single active document owned by a user within a workspace.
   */
  async findByWorkspaceIdAndOwnerIdAndId(
    props: FindDocumentByWorkspaceIdAndOwnerIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<DocumentListItemOutput | null> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          workspaceId: new UUID(props.workspaceId.value),
          ownerId: new UUID(props.ownerId.value),
          id: new UUID(props.documentId.value),
          deletedAt: null,
        },
      },

      ...this.buildUserEnrichmentStages(),

      {
        $project: {
          _id: 0,

          id: 1,
          title: 1,

          owner: {
            id: '$ownerUser.id',
            displayName: '$ownerUser.displayName',
            avatarUrl: '$ownerUser.avatarUrl',
          },

          createdBy: {
            id: '$createdByUser.id',
            displayName: '$createdByUser.displayName',
            avatarUrl: '$createdByUser.avatarUrl',
          },

          createdAt: 1,
          updatedAt: 1,
        },
      },

      {
        $limit: 1,
      },
    ]

    const [result] = await this.executeAggregation<DocumentListItemOutput>(
      pipeline,
      options
    )

    return result ?? null
  }

  async findSummariesByWorkspaceIdAndOwnerId(
    workspaceId: WorkspaceId,
    ownerId: UserId,
    options?: ITransactionOptions
  ): Promise<readonly DocumentSummaryOutput[]> {
    const documents = await this.documentModel
      .find(
        {
          workspaceId: workspaceId.value,
          ownerId: ownerId.value,
          deletedAt: null,
        },
        {
          _id: 0,
          id: 1,
          title: 1,
        },
        {
          session: options?.session,
        }
      )
      .sort({
        updatedAt: -1,
        id: 1,
      })
      .lean()
      .exec()

    return documents
  }

  /**
   * Enriches document records with the minimal user fields required
   * by UserSummaryOutput.
   *
   * The lookups are intentionally performed after the initial document
   * match so unrelated users are never joined into the query.
   */
  private buildUserEnrichmentStages(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'users',
          let: {
            ownerId: '$ownerId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$id', '$$ownerId'],
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
          as: 'ownerUser',
        },
      },

      {
        $unwind: {
          path: '$ownerUser',
          preserveNullAndEmptyArrays: false,
        },
      },

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
    ]
  }

  /**
   * Executes an aggregation pipeline with optional transaction support.
   */
  private async executeAggregation<T>(
    pipeline: PipelineStage[],
    options?: ITransactionOptions
  ): Promise<T[]> {
    const aggregation = this.documentModel.aggregate<T>(pipeline)

    if (options?.session) {
      aggregation.session(options.session)
    }

    return aggregation.exec()
  }
}
