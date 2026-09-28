import { Inject, Injectable } from '@nestjs/common'

import { TeamId } from '@/modules/team/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { SprintNotFoundException } from '../../../domain/exceptions'
import { SprintId } from '../../../domain/value-objects/sprint-id.vo'

import {
  SPRINT_QUERY_REPOSITORY,
  SprintQueryRepository,
} from '../../ports/sprint-query-repository.port'
import {
  SPRINT_REPOSITORY,
  SprintRepository,
} from '../../ports/sprint-repository.port'

import { UpdateSprintInput } from './update-sprint.input'
import { UpdateSprintOutput } from './update-sprint.output'
import { IUpdateSprintUseCase } from './update-sprint.interface'

/**
 * Updates a planned sprint.
 *
 * Domain rules are enforced by the Sprint aggregate.
 * Read concerns remain inside the dedicated query repository.
 */
@Injectable()
export class UpdateSprintUseCase implements IUpdateSprintUseCase {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepository,

    @Inject(SPRINT_QUERY_REPOSITORY)
    private readonly sprintQueryRepository: SprintQueryRepository
  ) {}

  async execute(input: UpdateSprintInput): Promise<UpdateSprintOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const teamId = TeamId.create(input.teamId)
    const sprintId = SprintId.create(input.sprintId)

    /**
     * Resolve the aggregate through a workspace and team scoped lookup.
     */
    const sprint = await this.sprintRepository.findByWorkspaceIdAndTeamIdAndId({
      workspaceId,
      teamId,
      sprintId,
    })

    if (!sprint) {
      throw new SprintNotFoundException()
    }

    /**
     * The Sprint aggregate enforces lifecycle and date invariants.
     */
    sprint.updateSprint({
      name: input.name,
      goal: input.goal,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
    })

    /**
     * Persist the updated aggregate.
     *
     * Mongoose timestamps update updatedAt automatically.
     */
    await this.sprintRepository.save(sprint)

    /**
     * Return the enriched read model instead of exposing
     * the domain aggregate through the presentation layer.
     */
    const result =
      await this.sprintQueryRepository.findByWorkspaceIdAndTeamIdAndId({
        workspaceId,
        teamId,
        sprintId,
      })

    if (!result) {
      throw new SprintNotFoundException()
    }

    return {
      sprint: result,
    }
  }
}
