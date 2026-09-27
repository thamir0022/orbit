import { TeamId } from '@/modules/team/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { ITransactionOptions } from '@/shared/application'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Sprint } from '../../../../domain/entities/sprint.entity'
import {
  FindSprintByWorkspaceIdAndTeamIdAndIdProps,
  FindSprintByWorkspaceIdAndTeamIdAndStatusProps,
  SprintRepository,
} from '../../../../application/ports/sprint-repository.port'
import { SprintId } from '../../../../domain/value-objects/sprint-id.vo'
import { SprintMapper } from '../mappers/sprint.mapper'
import { SprintDocument, SprintModel } from '../schemas/sprint.schema'

/**
 * MongoDB implementation of the Sprint repository port.
 *
 * Keeps Mongoose-specific persistence concerns inside the
 * infrastructure layer while exposing domain aggregates to
 * the application layer.
 */
export class MongoSprintRepository implements SprintRepository {
  constructor(
    @InjectModel(SprintModel.name)
    private readonly sprintModel: Model<SprintDocument>
  ) {}

  /**
   * Finds a sprint by its domain identifier.
   */
  async findById(
    id: SprintId,
    options?: ITransactionOptions
  ): Promise<Sprint | null> {
    const document = await this.sprintModel
      .findOne({ id: id.value })
      .session(options?.session ?? null)
      .lean()
      .exec()

    return document ? SprintMapper.toDomain(document) : null
  }

  /**
   * Returns all sprints belonging to a team.
   *
   * Results are ordered by the most recent sprint start date.
   */
  async findByWorkspaceIdAndTeamId(
    workspaceId: WorkspaceId,
    teamId: TeamId,
    options?: ITransactionOptions
  ): Promise<Sprint[]> {
    const documents = await this.sprintModel
      .find({
        workspaceId: workspaceId.value,
        teamId: teamId.value,
      })
      .sort({
        startDate: -1,
        createdAt: -1,
      })
      .session(options?.session ?? null)
      .lean()
      .exec()

    return documents.map((docuemt) => SprintMapper.toDomain(docuemt))
  }

  /**
   * Finds a sprint scoped to a workspace and team.
   *
   * The workspace/team filter provides an additional tenant boundary
   * instead of relying only on the sprint identifier.
   */
  async findByWorkspaceIdAndTeamIdAndId(
    props: FindSprintByWorkspaceIdAndTeamIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<Sprint | null> {
    const document = await this.sprintModel
      .findOne({
        id: props.sprintId.value,
        workspaceId: props.workspaceId.value,
        teamId: props.teamId.value,
      })
      .session(options?.session ?? null)
      .lean()
      .exec()

    return document ? SprintMapper.toDomain(document) : null
  }

  /**
   * Finds a sprint by its workspace, team, and lifecycle status.
   *
   * Commonly used to resolve the active sprint or validate
   * sprint lifecycle constraints.
   */
  async findByWorkspaceIdAndTeamIdAndStatus(
    props: FindSprintByWorkspaceIdAndTeamIdAndStatusProps,
    options?: ITransactionOptions
  ): Promise<Sprint | null> {
    const document = await this.sprintModel
      .findOne({
        workspaceId: props.workspaceId.value,
        teamId: props.teamId.value,
        status: props.status,
      })
      .session(options?.session ?? null)
      .lean()
      .exec()

    return document ? SprintMapper.toDomain(document) : null
  }

  /**
   * Persists a sprint aggregate.
   *
   * Mongoose timestamps manage createdAt and updatedAt.
   * Domain state is mapped to persistence state through the mapper.
   */
  async save(sprint: Sprint, options?: ITransactionOptions) {
    const persistenceData = SprintMapper.toPersistence(sprint)

    await this.sprintModel
      .findOneAndUpdate(
        {
          id: sprint.id.value,
        },
        {
          $set: persistenceData,
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
          session: options?.session,
        }
      )
      .lean()
      .exec()
  }

  /**
   * Permanently removes a sprint by its domain identifier.
   */
  async delete(id: SprintId, options?: ITransactionOptions): Promise<void> {
    await this.sprintModel
      .deleteOne({
        id: id.value,
      })
      .session(options?.session ?? null)
      .exec()
  }
}
