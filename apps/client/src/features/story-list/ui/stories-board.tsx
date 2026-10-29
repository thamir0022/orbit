import type { Story } from '@/entities/story'
import { WORK_ITEM_STATUSES, type WorkItemStatus } from '@/entities/work-item'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

import {
  getStoryStatusLabel,
  getStoryStatusStyle,
} from '../model/story-presentation'
import { StoryCard } from './story-card'

interface StoriesBoardProps {
  readonly stories: readonly Story[]
}

const STATUS_COLUMNS = [
  WORK_ITEM_STATUSES.BACKLOG,
  WORK_ITEM_STATUSES.TODO,
  WORK_ITEM_STATUSES.IN_PROGRESS,
  WORK_ITEM_STATUSES.IN_REVIEW,
  WORK_ITEM_STATUSES.DONE,
  WORK_ITEM_STATUSES.CANCELLED,
] as const

function groupStoriesByStatus(
  stories: readonly Story[]
): Map<WorkItemStatus, Story[]> {
  const grouped = new Map<WorkItemStatus, Story[]>()

  for (const story of stories) {
    const current = grouped.get(story.status) ?? []
    current.push(story)
    grouped.set(story.status, current)
  }

  return grouped
}

export function StoriesBoard({ stories }: StoriesBoardProps) {
  const storiesByStatus = groupStoriesByStatus(stories)

  return (
    <div className="flex w-max gap-3 p-3 pb-5">
      {STATUS_COLUMNS.map((status) => {
        const statusStories = storiesByStatus.get(status) ?? []
        const styles = getStoryStatusStyle(status)
        const headingId = `story-status-${status}`

        return (
          <section
            key={status}
            aria-labelledby={headingId}
            className={cn(
              'w-72 shrink-0 rounded-xl p-2 sm:w-80',
              styles.column
            )}
          >
            <div className="flex items-center justify-between gap-3 px-2 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    styles.indicator
                  )}
                />
                <h2 id={headingId} className="truncate text-sm font-medium">
                  {getStoryStatusLabel(status)}
                </h2>
              </div>

              <Badge
                variant="secondary"
                aria-label={`${statusStories.length} stories`}
                className="min-w-5 justify-center rounded-full px-1.5 text-[10px]"
              >
                {statusStories.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {statusStories.length ? (
                statusStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))
              ) : (
                <p className="flex min-h-20 items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs text-muted-foreground">
                  No stories
                </p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
