import type { Project } from '@/entities/project/model/project.types'
import {
  ProjectPriority,
  ProjectStage,
  ProjectStatus,
  ProjectType,
  type UpdateProjectInput,
} from '@/entities/project/model/project.types'

import type { UpdateProjectFormValues } from '../model/update-project.schema'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const parseDateValue = (value: string): Date | undefined => {
  const datePart = value.slice(0, 10)

  if (!DATE_ONLY_PATTERN.test(datePart)) {
    return undefined
  }

  const [year, month, day] = datePart.split('-').map(Number)

  const date = new Date(year, month - 1, day)

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

export const formatDatePart = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const toDateTimeLocalValue = (date: Date): string =>
  `${formatDatePart(date)}T00:00`

export const buildFieldUpdateInput = (
  field: keyof UpdateProjectFormValues,
  value: UpdateProjectFormValues[keyof UpdateProjectFormValues],
  workspaceId: string,
  key: string
): UpdateProjectInput => {
  const input: UpdateProjectInput = {
    workspaceId,
    key,
  }

  switch (field) {
    case 'name':
      input.name = String(value).trim()
      break

    case 'description':
      input.description = String(value).trim()
      break

    case 'type':
      input.type = value as ProjectType
      break

    case 'stage':
      input.stage = value as ProjectStage
      break

    case 'priority':
      input.priority = value as ProjectPriority
      break

    case 'status':
      input.status = value as ProjectStatus
      break

    case 'leadId':
      input.leadId = value as string | null
      break

    case 'startDate':
      input.startDate = fromDateTimeLocalValue(String(value))
      break

    case 'targetEndDate':
      input.targetEndDate = fromDateTimeLocalValue(String(value))
      break

    default:
      break
  }

  return input
}

export const getProjectOverviewPath = (
  workspaceSlug: string,
  projectKey: string
): string => `/${workspaceSlug}/projects/${projectKey}/overview`

export const getProjectUserStoriesPath = (
  workspaceSlug: string,
  projectKey: string
): string => `/${workspaceSlug}/projects/${projectKey}/user-stories`

export const getUpdateProjectDefaultValues = (
  project: Project
): UpdateProjectFormValues => ({
  name: project.name,
  description: project.description ?? '',
  avatarUrl: project.avatarUrl ?? '',
  type: project.type,
  stage: project.stage,
  priority: project.priority,
  status: project.status,
  leadId: project.lead?.id ?? null,
  startDate: project.startDate ?? '',
  targetEndDate: project.targetEndDate ?? '',
})

export const fromDateTimeLocalValue = (value: string): Date | null => {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}
