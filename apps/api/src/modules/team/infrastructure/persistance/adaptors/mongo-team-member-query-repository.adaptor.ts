import { Injectable } from '@nestjs/common'
import { Model, PipelineStage } from 'mongoose'
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

  /** Joins member and actor identities into the public membership read model. */
  private buildMemberProjectionPipeline(): PipelineStage[] {
    return [
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
          as: 'addedByUser',
        },
      },
      { $unwind: '$user' },
      { $unwind: '$addedByUser' },
      {
        $project: {
          _id: 0,
          id: '$user.id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          displayName: '$user.displayName',
          email: '$user.email',
          status: 1,
          joinedAt: 1,
          addedBy: {
            id: '$addedByUser.id',
            email: '$addedByUser.email',
            displayName: '$addedByUser.displayName',
            avatarUrl: { $ifNull: ['$addedByUser.avatarUrl', null] },
          },
        },
      },
    ]
  }

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
          $sort: {
            status: 1,
            joinedAt: -1,
          },
        },

        ...this.buildMemberProjectionPipeline(),
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

        ...this.buildMemberProjectionPipeline(),
      ])
      .session(options?.session ?? null)
      .limit(1)
      .exec()

    return result[0] ?? null
  }
}
