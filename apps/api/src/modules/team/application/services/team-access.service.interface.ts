import { ITransactionOptions } from '@/shared/application'
import { Team } from '../../domain/entities/team.entity'

export interface ITeamAccessService {
  assertMember(
    team: Team,
    actorId: string,
    options?: ITransactionOptions
  ): Promise<void>
  assertLead(
    team: Team,
    actorId: string,
    options?: ITransactionOptions
  ): Promise<void>
}
export const TEAM_ACCESS_SERVICE = Symbol('TeamAccessService')
