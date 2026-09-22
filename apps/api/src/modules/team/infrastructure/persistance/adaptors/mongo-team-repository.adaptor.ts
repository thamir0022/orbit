import { TeamId } from '../../../domain/value-objects/team-id.vo'
import { Team } from '../../../domain/entities/team.entity'
import { TeamMapper } from '../../../application/mappers/team.mapper'
import {
  DeleteTeamByWorkspaceIdAndIdProps,
  FindTeamByWorkspaceIdAndIdProps,
  TeamRepository,
} from '../../../application/ports/team-repository.port'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { TeamDocument, TeamModel } from '../schemas/team.schema'
import { Model } from 'mongoose'
import { ITransactionOptions } from '@/shared/application'
import { WorkspaceId } from '@/modules/workspace/domain'

@Injectable()
export class MongoTeamRepository implements TeamRepository {
  constructor(
    @InjectModel(TeamModel.name)
    private readonly teamModel: Model<TeamDocument>
  ) {}

  async findById(
    teamId: TeamId,
    options?: ITransactionOptions
  ): Promise<Team | null> {
    const document = await this.teamModel
      .findOne(
        {
          id: teamId.value,
        },
        null,
        {
          session: options?.session,
        }
      )
      .lean()
      .exec()

    return document ? TeamMapper.toDomainDto(document) : null
  }

  async findByWorkspaceId(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<Team[]> {
    const documents = await this.teamModel
      .find(
        {
          workspaceId: workspaceId.value,
        },
        null,
        {
          session: options?.session,
        }
      )
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec()

    return documents.map((doc) => TeamMapper.toDomainDto(doc))
  }

  async findByWorkspaceIdAndId(
    props: FindTeamByWorkspaceIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<Team | null> {
    const document = await this.teamModel
      .findOne(
        {
          workspaceId: props.workspaceId.value,
          id: props.teamId.value,
        },
        null,
        {
          session: options?.session,
        }
      )
      .lean()
      .exec()

    return document ? TeamMapper.toDomainDto(document) : null
  }

  async save(team: Team, options?: ITransactionOptions): Promise<void> {
    const persistenceModel = TeamMapper.toPersistance(team)

    await this.teamModel
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

  async delete(teamId: TeamId, options?: ITransactionOptions): Promise<void> {
    await this.teamModel
      .deleteOne(
        {
          id: teamId.value,
        },
        {
          session: options?.session,
        }
      )
      .exec()
  }

  async deleteByWorkspaceIdAndId(
    props: DeleteTeamByWorkspaceIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.teamModel
      .deleteOne(
        {
          workspaceId: props.workspaceId.value,
          id: props.teamId.value,
        },
        {
          session: options?.session,
        }
      )
      .exec()
  }
}
