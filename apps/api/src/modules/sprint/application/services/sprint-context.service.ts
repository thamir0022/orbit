import { Inject, Injectable } from '@nestjs/common'
import { TeamId } from '@/modules/team/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  TEAM_REPOSITORY,
  TeamRepository,
} from '@/modules/team/application/ports/team-repository.port'
import {
  TEAM_ACCESS_SERVICE,
  ITeamAccessService,
} from '@/modules/team/application/services/team-access.service.interface'
import {
  TeamNotFoundException,
  TeamInactiveException,
} from '@/modules/team/domain/exceptions'
import { SprintId } from '../../domain/value-objects/sprint-id.vo'
import { SprintNotFoundException } from '../../domain/exceptions'
import {
  SPRINT_REPOSITORY,
  SprintRepository,
} from '../ports/sprint-repository.port'
import { SprintScope } from '../ports/sprint-work-item-repository.port'
import { ITransactionOptions } from '@/shared/application'

export interface SprintActorScope extends SprintScope {
  actorId: string
}

export interface ISprintContextService {
  resolve(
    input: SprintActorScope,
    access: 'member' | 'lead',
    options?: ITransactionOptions,
    allowArchived?: boolean
  ): Promise<import('../../domain/entities/sprint.entity').Sprint>
}

export const SPRINT_CONTEXT_SERVICE = Symbol('SprintContextService')

/** Resolves an authorized sprint inside its owning workspace and team. */

@Injectable()
export class SprintContextService implements ISprintContextService {
  constructor(
    @Inject(TEAM_REPOSITORY) private readonly teams: TeamRepository,
    @Inject(TEAM_ACCESS_SERVICE) private readonly access: ITeamAccessService,
    @Inject(SPRINT_REPOSITORY) private readonly sprints: SprintRepository
  ) {}

  // Resolve scope before exposing sprint data or applying mutations.
  async resolve(
    input: SprintActorScope,
    access: 'member' | 'lead',
    options?: ITransactionOptions,
    allowArchived = false
  ) {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const teamId = TeamId.create(input.teamId)
    const team = await this.teams.findByWorkspaceIdAndId(
      workspaceId,
      teamId,
      options
    )
    if (!team) throw new TeamNotFoundException()
    await (access === 'lead'
      ? this.access.assertLead(team, input.actorId, options)
      : this.access.assertMember(team, input.actorId, options))
    if (!allowArchived && !team.isActive) throw new TeamInactiveException()
    const sprint = await this.sprints.findByWorkspaceIdAndTeamIdAndId(
      { workspaceId, teamId, sprintId: SprintId.create(input.sprintId) },
      options
    )
    if (!sprint) throw new SprintNotFoundException()
    return sprint
  }
}
