export const formatTypeLabel = (val: string) =>
  val
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const formatSizeLabel = (val: string) => {
  if (val === 'solo') return 'Just Me'
  if (val.includes('plus'))
    return val.replace('enterprise_', '').replace('_plus', ' +')
  return val.split('_').slice(1).join(' - ')
}

export const generateSlug = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces -> hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, '') // trim hyphens
}
