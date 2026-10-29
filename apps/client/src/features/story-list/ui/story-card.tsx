import { ArrowDown, ArrowRight, ArrowUp, ChevronsUp } from 'lucide-react'

import type { Story } from '@/entities/story'
import { StoryLink } from './story-link'
import {
  WORK_ITEM_PRIORITIES,
  type WorkItemPriority,
} from '@/entities/work-item'
import { getInitials } from '@/shared/lib/get-initials'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'

import {
  getStoryStatusLabel,
  getStoryStatusStyle,
} from '../model/story-presentation'

interface StoryCardProps {
  readonly story: Story
}

const PRIORITY_STYLES: Record<
  WorkItemPriority,
  {
    readonly label: string
    readonly className: string
    readonly icon: typeof ArrowRight
  }
> = {
  [WORK_ITEM_PRIORITIES.URGENT]: {
    label: 'Urgent',
    className: 'text-rose-600',
    icon: ChevronsUp,
  },
  [WORK_ITEM_PRIORITIES.HIGH]: {
    label: 'High',
    className: 'text-orange-600',
    icon: ArrowUp,
  },
  [WORK_ITEM_PRIORITIES.MEDIUM]: {
    label: 'Medium',
    className: 'text-amber-600',
    icon: ArrowRight,
  },
  [WORK_ITEM_PRIORITIES.LOW]: {
    label: 'Low',
    className: 'text-sky-600',
    icon: ArrowDown,
  },
}

export function StoryCard({ story }: StoryCardProps) {
  const assigneeName = story.assignee?.name ?? 'Unassigned'
  const priority = story.priority ? PRIORITY_STYLES[story.priority] : null
  const PriorityIcon = priority?.icon
  const statusStyle = getStoryStatusStyle(story.status)
  const titleId = `story-card-${story.id}-title`

  return (
    <Card
      aria-labelledby={titleId}
      className="gap-0 py-0 shadow-none transition-colors hover:border-foreground/20"
    >
      <CardContent className="p-3.5">
        <div className="flex min-w-0 items-center">
          <div className="min-w-0 w-full">
            <h3
              id={titleId}
              className="line-clamp-2 text-sm font-medium leading-5"
            >
              <StoryLink storyKey={story.key} title={story.title} />
            </h3>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            aria-label={`Status: ${getStoryStatusLabel(story.status)}`}
            className={`font-normal ${statusStyle.badge}`}
          >
            {getStoryStatusLabel(story.status)}
          </Badge>

          {priority && PriorityIcon ? (
            <Badge
              variant="outline"
              aria-label={`Priority: ${priority.label}`}
              className={`gap-1 font-normal ${priority.className}`}
            >
              <PriorityIcon aria-hidden="true" className="size-3" />
              {priority.label}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              aria-label="Priority: No priority"
              className="font-normal text-muted-foreground"
            >
              No priority
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
          <div
            className="flex min-w-0 items-center gap-2"
            aria-label={`Assignee: ${assigneeName}`}
          >
            {story.assignee ? (
              <Avatar className="size-5 shrink-0">
                <AvatarImage
                  src={story.assignee.avatarUrl ?? undefined}
                  alt={assigneeName}
                />
                <AvatarFallback className="text-[9px]">
                  {getInitials(assigneeName)}
                </AvatarFallback>
              </Avatar>
            ) : null}
            <span className="min-w-0 truncate text-xs">{assigneeName}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
            <span
              aria-label={
                story.storyPoints === null
                  ? 'No story points'
                  : `${story.storyPoints} story points`
              }
            >
              {story.storyPoints === null ? '—' : `${story.storyPoints} pts`}
            </span>
            <span aria-label={`Sprint: ${story.sprint?.name ?? 'No sprint'}`}>
              {story.sprint?.name ?? 'No sprint'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
