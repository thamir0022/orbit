import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  tableFeatures,
} from '@tanstack/react-table'

export const workspaceRolesTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,

  filteredRowModel: createFilteredRowModel(),

  filterFns: {
    includesString: filterFn_includesString,
  },
})

export type WorkspaceRolesTableFeatures = typeof workspaceRolesTableFeatures
