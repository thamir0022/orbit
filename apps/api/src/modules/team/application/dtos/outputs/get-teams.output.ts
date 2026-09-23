import { TeamDto } from '../../contracts/team.dto'

export interface GetTeamsOutput {
  readonly teams: TeamDto[]
}
