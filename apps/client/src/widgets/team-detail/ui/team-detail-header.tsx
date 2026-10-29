'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'

import type { Team } from '@/entities/team'
import { DeleteTeamButton } from '@/features/delete-team/ui/delete-team-button'
import { BackButton } from '@/shared/ui/back-button'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

interface TeamDetailHeaderProps {
  readonly team: Team
  readonly workspaceSlug: string
  readonly activeTab: 'overview' | 'members'
}

export function TeamDetailHeader({
  team,
  workspaceSlug,
  activeTab,
}: TeamDetailHeaderProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const teamPath = `/${workspaceSlug}/teams/${team.key}`
  const teamsPath = `/${workspaceSlug}/teams`

  return (
    <header className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <BackButton title="Teams" fallbackHref={teamsPath} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Team actions"
            >
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 aria-hidden="true" className="size-4" /> Delete team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DeleteTeamButton
          teamKey={team.key}
          teamName={team.name}
          teamsPath={teamsPath}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">Team</p>
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          {team.name}
        </h1>
      </div>
      <nav
        aria-label="Team navigation"
        className="flex flex-wrap items-center gap-2"
      >
        <Tabs value={activeTab}>
          <TabsList aria-label="Team sections">
            <TabsTrigger value="overview" asChild>
              <Link href={teamPath}>Overview</Link>
            </TabsTrigger>
            <TabsTrigger value="stories" asChild>
              <Link href={`${teamPath}/stories`}>Stories</Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`${teamPath}/members`}>Members</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>
    </header>
  )
}
