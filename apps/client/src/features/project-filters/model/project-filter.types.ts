import type {
  ProjectPriority,
  ProjectStage,
  ProjectStatus,
  ProjectType,
} from '@/entities/project/model/project.types'

/**
 * Sortable fields exposed by the project list UI.
 *
 * The order intentionally matches the project table column order.
 *
 * Lead is excluded because the backend does not currently support
 * sorting projects by lead.
 */
export const PROJECT_SORT_FIELDS = [
  'name',
  'type',
  'status',
  'stage',
  'priority',
  'startDate',
  'targetEndDate',
] as const

export type ProjectSortField = (typeof PROJECT_SORT_FIELDS)[number]

export type ProjectSortOrder = 'asc' | 'desc'

export const isProjectSortField = (
  value: string
): value is ProjectSortField => {
  return PROJECT_SORT_FIELDS.includes(value as ProjectSortField)
}

export interface ProjectQueryParams {
  readonly page?: number
  readonly limit?: number

  readonly search?: string

  readonly types?: readonly ProjectType[]
  readonly stages?: readonly ProjectStage[]
  readonly priorities?: readonly ProjectPriority[]
  readonly statuses?: readonly ProjectStatus[]

  readonly leadId?: string

  readonly startDateFrom?: string
  readonly startDateTo?: string

  readonly targetEndDateFrom?: string
  readonly targetEndDateTo?: string

  readonly sortField?: ProjectSortField
  readonly sortOrder?: ProjectSortOrder
}

export interface ProjectFilterOption<TValue extends string = string> {
  readonly value: TValue
  readonly label: string
}
