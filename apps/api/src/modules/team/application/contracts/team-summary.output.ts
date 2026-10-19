/**
 * Lightweight representation of a team used for
 * navigation and team selection.
 *
 * Contains only the fields required by consumers
 * that do not need the complete team representation.
 */
export interface TeamSummaryOutput {
  readonly key: string
  readonly name: string
  readonly avatarUrl?: string
}
