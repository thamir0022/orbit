import type { WorkspacePermission } from '@/entities/permission'

export interface PermissionGroup {
  resource: string
  permissions: WorkspacePermission[]
}

export function groupPermissionsByResource(
  permissions: WorkspacePermission[]
): PermissionGroup[] {
  const map = new Map<string, WorkspacePermission[]>()

  for (const permission of permissions) {
    const current = map.get(permission.resource) ?? []
    current.push(permission)
    map.set(permission.resource, current)
  }

  return Array.from(map.entries())
    .map(([resource, items]) => ({
      resource,
      permissions: items.sort((a, b) => a.action.localeCompare(b.action)),
    }))
    .sort((a, b) => a.resource.localeCompare(b.resource))
}

export function prettifyLabel(value: string): string {
  return value.replaceAll('_', ' ')
}
