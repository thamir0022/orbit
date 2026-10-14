export function formatTeamDate(
  value: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...options,
  }).format(new Date(value))
}

export function getTeamInitials(name: string): string {
  return name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatTeamStatus(status: string): string {
  return status
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
