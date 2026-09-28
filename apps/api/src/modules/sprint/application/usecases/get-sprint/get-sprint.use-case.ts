import { Inject, Injectable } from '@nestjs/common'

import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '@/modules/team/domain'

import {
  SPRINT_QUERY_REPOSITORY,
  SprintQueryRepository,
} from '../../ports/sprint-query-repository.port'
import { SprintId } from '../../../domain/value-objects/sprint-id.vo'
import { SprintNotFoundException } from '../../../domain/exceptions'

import { GetSprintInput } from './get-sprint.input'
import { GetSprintOutput } from './get-sprint.output'
import { IGetSprintUseCase } from './get-sprint.interface'

/**
 * Retrieves a single sprint using the optimized query repository.
 */
@Injectable()
export class GetSprintUseCase implements IGetSprintUseCase {
  constructor(
    @Inject(SPRINT_QUERY_REPOSITORY)
    private readonly sprintQueryRepository: SprintQueryRepository
  ) {}

  async execute(input: GetSprintInput): Promise<GetSprintOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const teamId = TeamId.create(input.teamId)
    const sprintId = SprintId.create(input.sprintId)

    const sprint =
      await this.sprintQueryRepository.findByWorkspaceIdAndTeamIdAndId({
        workspaceId,
        teamId,
        sprintId,
      })

    if (!sprint) {
      throw new SprintNotFoundException()
    }

    return {
      sprint,
    }
  }
}
