import { rowSortingFeature, tableFeatures } from '@tanstack/react-table'

export const storyTableFeatures = tableFeatures({
  rowSortingFeature,
})

export type StoryTableFeatures = typeof storyTableFeatures
