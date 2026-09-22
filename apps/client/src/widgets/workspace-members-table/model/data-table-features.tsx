import { columnVisibilityFeature, tableFeatures } from '@tanstack/react-table'

export const workspaceMembersTableFeatures = tableFeatures({
  columnVisibilityFeature,
})

export type WorkspaceMembersTableFeatures = typeof workspaceMembersTableFeatures
