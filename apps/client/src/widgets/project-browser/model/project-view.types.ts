export type ProjectViewMode = 'list' | 'board'

export const PROJECT_VIEW_MODES = {
  LIST: 'list',
  BOARD: 'board',
} as const satisfies Record<string, ProjectViewMode>
