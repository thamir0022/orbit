export type StoryViewMode = 'list' | 'board'

export const STORY_VIEW_MODES = {
  LIST: 'list',
  BOARD: 'board',
} as const satisfies Record<string, StoryViewMode>
