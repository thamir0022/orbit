import { SprintActorScope } from '../../services/sprint-context.service'
import { SprintSummaryOutput } from './get-sprint-summary.output'

export interface IGetSprintSummaryUseCase {
  execute(input: SprintActorScope): Promise<SprintSummaryOutput>
}
export const GET_SPRINT_SUMMARY = Symbol('GetSprintSummary')
