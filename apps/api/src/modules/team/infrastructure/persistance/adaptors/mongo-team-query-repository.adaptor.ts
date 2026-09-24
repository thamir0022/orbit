import { UUID } from 'mongodb'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ITransactionOptions } from '@/shared/application'
import {
  FindTeamByWorkspaceIdAndIdQueryProps,
  TeamQueryRepository,
} from '../../../application/ports/team-query-repository.port'
import { TeamDocument, TeamModel } from '../schemas/team.schema'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamListItemOutput } from '@/modules/team/application/contracts/team-list-item.output'

@Injectable()
export class MongoTeamQueryRepository implements TeamQueryRepository {
  constructor(
    @InjectModel(TeamModel.name)
    private readonly teamModel: Model<TeamDocument>
  ) {}

  async findByWorkspaceId(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<TeamListItemOutput[]> {
    return this.teamModel
      .aggregate<TeamListItemOutput>([
        {
          $match: {
            workspaceId: new UUID(workspaceId.value),
            deletedAt: null,
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: 'leadId',
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
            as: 'lead',
          },
        },

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
            as: 'createdBy',
          },
        },

        {
          $unwind: {
            path: '$lead',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $unwind: '$createdBy',
        },

        {
          $project: {
            _id: 0,
            id: 1,
            workspaceId: 1,
            name: 1,
            description: 1,
            avatarUrl: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,

            lead: {
              id: '$lead.id',
              displayName: '$lead.displayName',
              avatarUrl: '$lead.avatarUrl',
            },

            createdBy: {
              id: '$createdBy.id',
              displayName: '$createdBy.displayName',
              avatarUrl: '$createdBy.avatarUrl',
            },
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .session(options?.session ?? null)
      .exec()
  }

  async findByWorkspaceIdAndId(
    props: FindTeamByWorkspaceIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<TeamListItemOutput | null> {
    const [team] = await this.teamModel
      .aggregate<TeamListItemOutput>([
        {
          $match: {
            workspaceId: new UUID(props.workspaceId.value),
            id: new UUID(props.teamId.value),
            deletedAt: null,
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: 'leadId',
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
            as: 'lead',
          },
        },

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
            as: 'createdBy',
          },
        },

        {
          $unwind: {
            path: '$lead',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $unwind: '$createdBy',
        },

        {
          $project: {
            _id: 0,
            id: 1,
            workspaceId: 1,
            name: 1,
            description: 1,
            avatarUrl: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,

            lead: {
              id: '$lead.id',
              displayName: '$lead.displayName',
              avatarUrl: '$lead.avatarUrl',
            },

            createdBy: {
              id: '$createdBy.id',
              displayName: '$createdBy.displayName',
              avatarUrl: '$createdBy.avatarUrl',
            },
          },
        },
      ])
      .session(options?.session ?? null)
      .exec()

    return team ?? null
  }
}
