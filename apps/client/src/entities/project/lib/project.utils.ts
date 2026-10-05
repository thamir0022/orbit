export const formatEnumLabel = (value: string): string => {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export const formatProjectDate = (
  date?: string | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) {
    return 'No date'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    options ?? {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(new Date(date))
}

export const getInitials = (value?: string | null): string => {
  if (!value?.trim()) {
    return '?'
  }

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
