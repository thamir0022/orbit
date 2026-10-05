import { rowSortingFeature, tableFeatures } from '@tanstack/react-table'

export const projectTableFeatures = tableFeatures({
  rowSortingFeature,
})

export type ProjectTableFeatures = typeof projectTableFeatures
