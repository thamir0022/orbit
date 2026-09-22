import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { ITransactionOptions } from '@/shared/application'

import { TeamMember } from '../../../domain/entities/team-member.entity'
import { TeamMemberId } from '../../../domain/value-objects/team-member-id.vo'
import { TeamMemberMapper } from '../../../application/mappers/team-member.mapper'
import {
  DeleteTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
  FindTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
  FindTeamMembersByWorkspaceIdAndTeamIdProps,
  TeamMemberRepository,
} from '../../../application/ports/team-member-repository.port'
import {
  TeamMemberDocument,
  TeamMemberModel,
} from '../schemas/team-member.schema'

@Injectable()
export class MongoTeamMemberRepository implements TeamMemberRepository {
  constructor(
    @InjectModel(TeamMemberModel.name)
    private readonly teamMemberModel: Model<TeamMemberDocument>
  ) {}

  async findById(
    teamMemberId: TeamMemberId,
    options?: ITransactionOptions
  ): Promise<TeamMember | null> {
    const document = await this.teamMemberModel
      .findOne(
        {
          id: teamMemberId.value,
        },
        null,
        {
          session: options?.session,
        }
      )
      .lean()
      .exec()

    return document ? TeamMemberMapper.toDomainDto(document) : null
  }

  async findByWorkspaceIdAndTeamId(
    props: FindTeamMembersByWorkspaceIdAndTeamIdProps,
    options?: ITransactionOptions
  ): Promise<TeamMember[]> {
    const documents = await this.teamMemberModel
      .find(
        {
          workspaceId: props.workspaceId.value,
          teamId: props.teamId.value,
        },
        null,
        {
          session: options?.session,
        }
      )
      .sort({
        joinedAt: -1,
      })
      .lean()
      .exec()

    return documents.map((document) => TeamMemberMapper.toDomainDto(document))
  }

  async findByWorkspaceIdAndTeamIdAndUserId(
    props: FindTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
    options?: ITransactionOptions
  ): Promise<TeamMember | null> {
    const document = await this.teamMemberModel
      .findOne(
        {
          workspaceId: props.workspaceId.value,
          teamId: props.teamId.value,
          userId: props.userId.value,
        },
        null,
        {
          session: options?.session,
        }
      )
      .lean()
      .exec()

    return document ? TeamMemberMapper.toDomainDto(document) : null
  }

  async save(
    teamMember: TeamMember,
    options?: ITransactionOptions
  ): Promise<void> {
    const persistenceModel = TeamMemberMapper.toPersistance(teamMember)

    await this.teamMemberModel
      .replaceOne(
        {
          id: persistenceModel.id,
        },
        persistenceModel,
        {
          upsert: true,
          runValidators: true,
          session: options?.session,
        }
      )
      .exec()
  }

  async delete(
    teamMemberId: TeamMemberId,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.teamMemberModel
      .deleteOne(
        {
          id: teamMemberId.value,
        },
        {
          session: options?.session,
        }
      )
      .exec()
  }

  async deleteByWorkspaceIdAndTeamIdAndUserId(
    props: DeleteTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.teamMemberModel
      .deleteOne(
        {
          workspaceId: props.workspaceId.value,
          teamId: props.teamId.value,
          userId: props.userId.value,
        },
        {
          session: options?.session,
        }
      )
      .exec()
  }
}
