import { ActiveSession } from '../../contracts'

export interface GetActiveSessionsOutputDto {
  sessions: ActiveSession[] | null
  total: number
}
