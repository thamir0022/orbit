import type { CreateProjectRequest } from '../api/create-project.api'
import type { CreateProjectFormValues } from '../model/create-project.schema'

export const formatEnumLabel = (value: string): string =>
  value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

export const formatDateValue = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const parseDateValue = (value?: string): Date | undefined => {
  if (!value) {
    return undefined
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return undefined
  }

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

export const formatDateLabel = (value?: string): string => {
  if (!value) {
    return 'Start date'
  }

  const date = parseDateValue(value)

  if (!date) {
    return 'Start date'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const toApiDate = (value?: string): Date | undefined => {
  if (!value) {
    return undefined
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day))
}

export const buildCreateProjectRequest = (
  values: CreateProjectFormValues
): CreateProjectRequest => {
  const description = values.description?.trim()

  return {
    name: values.name.trim(),

    ...(description ? { description } : {}),

    ...(values.type ? { type: values.type } : {}),

    ...(values.stage ? { stage: values.stage } : {}),

    ...(values.priority ? { priority: values.priority } : {}),

    ...(values.startDate ? { startDate: toApiDate(values.startDate) } : {}),

    ...(values.targetEndDate
      ? { targetEndDate: toApiDate(values.targetEndDate) }
      : {}),
  }
}
