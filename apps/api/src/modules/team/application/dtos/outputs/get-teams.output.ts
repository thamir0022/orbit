import { TeamSummaryOutput } from '../../contracts/team-summary.output'

export interface GetTeamsOutput {
  readonly teams: readonly TeamSummaryOutput[]
}
