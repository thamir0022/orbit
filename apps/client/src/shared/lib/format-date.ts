export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  readonly locale?: string
}

export function formatDate(
  value?: string | null,
  options: FormatDateOptions = {}
): string {
  if (!value?.trim()) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const { locale = 'en-IN', ...formatOptions } = options

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...formatOptions,
  }).format(date)
}
