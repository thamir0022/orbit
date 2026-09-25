import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { ITransactionOptions } from '@/shared/application'
import {
  FindTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
  FindTeamMembersByWorkspaceIdAndTeamIdProps,
  TeamMemberQueryRepository,
} from '../../../application/ports/team-member-query-repository.port'
import {
  TeamMemberDocument,
  TeamMemberModel,
} from '../schemas/team-member.schema'
import { TeamMemberListItem } from '../../../application/contracts/team-member-list-item.output'
import { UUID } from 'mongodb'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class MongoTeamMemberQueryRepository implements TeamMemberQueryRepository {
  constructor(
    @InjectModel(TeamMemberModel.name)
    private readonly teamMemberModel: Model<TeamMemberDocument>
  ) {}

  async findByWorkspaceIdAndTeamId(
    props: FindTeamMembersByWorkspaceIdAndTeamIdProps,
    options?: ITransactionOptions
  ): Promise<TeamMemberListItem[]> {
    const { workspaceId, teamId } = props

    return this.teamMemberModel
      .aggregate<TeamMemberListItem>([
        {
          $match: {
            workspaceId: new UUID(workspaceId.value),
            teamId: new UUID(teamId.value),
            deletedAt: null,
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'id',
            as: 'user',
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: 'id',
            as: 'addedBy',
          },
        },

        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $unwind: {
            path: '$addedBy',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,

            userId: {
              id: '$user.id',
              name: '$user.name',
              email: '$user.email',
              avatarUrl: '$user.avatarUrl',
            },

            status: 1,

            addedBy: {
              id: '$addedBy.id',
              name: '$addedBy.name',
              email: '$addedBy.email',
              avatarUrl: '$addedBy.avatarUrl',
            },

            joinedAt: 1,
          },
        },

        {
          $sort: {
            joinedAt: -1,
          },
        },
      ])
      .session(options?.session ?? null)
      .exec()
  }

  async findByWorkspaceIdAndTeamIdAndUserId(
    props: FindTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
    options?: ITransactionOptions
  ): Promise<TeamMemberListItem | null> {
    const { workspaceId, teamId, userId } = props

    const result = await this.teamMemberModel
      .aggregate<TeamMemberListItem>([
        {
          $match: {
            workspaceId: new UUID(workspaceId.value),
            teamId: new UUID(teamId.value),
            userId: new UUID(userId.value),
            deletedAt: null,
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'id',
            as: 'user',
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: 'id',
            as: 'addedBy',
          },
        },

        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $unwind: {
            path: '$addedBy',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,

            userId: {
              id: '$user.id',
              name: '$user.name',
              email: '$user.email',
              avatarUrl: '$user.avatarUrl',
            },

            status: 1,

            addedBy: {
              id: '$addedBy.id',
              name: '$addedBy.name',
              email: '$addedBy.email',
              avatarUrl: '$addedBy.avatarUrl',
            },

            joinedAt: 1,
          },
        },
      ])
      .session(options?.session ?? null)
      .limit(1)
      .exec()

    return result[0] ?? null
  }
}
