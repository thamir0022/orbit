'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronRight, Plus, Users } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/shared/ui/sidebar'

import { CreateTeamDialog } from '@/features/team/create-team'

interface TeamNavigationItem {
  readonly id: string
  readonly name: string
  readonly slug: string
}

interface NavTeamsProps {
  readonly workspaceSlug: string
}

const TEAM_NAVIGATION_ITEMS = [
  {
    id: 'team-1',
    name: 'Frontend Team',
    slug: 'frontend',
  },
  {
    id: 'team-2',
    name: 'Backend Team',
    slug: 'backend',
  },
  {
    id: 'team-3',
    name: 'Design Team',
    slug: 'design',
  },
  {
    id: 'team-4',
    name: 'Product Team',
    slug: 'product',
  },
] satisfies readonly TeamNavigationItem[]

export function NavTeams({ workspaceSlug }: NavTeamsProps) {
  const pathname = usePathname()

  const activeTeam = TEAM_NAVIGATION_ITEMS.some(
    (team) =>
      pathname === `/${workspaceSlug}/teams/${team.slug}` ||
      pathname.startsWith(`/${workspaceSlug}/teams/${team.slug}/`)
  )

  const [open, setOpen] = useState(activeTeam)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/teams">
      <SidebarGroup>
        <div className="flex items-center gap-1 px-2">
          <SidebarGroupLabel asChild className="min-w-0 flex-1">
            <CollapsibleTrigger
              aria-label={open ? 'Collapse teams' : 'Expand teams'}
              className="w-full"
            >
              <Users className="mr-1 size-4 shrink-0" aria-hidden="true" />

              <span>Teams</span>

              <ChevronRight
                className="
                  ml-auto
                  size-4
                  shrink-0
                  transition-transform
                  duration-200
                  group-data-[state=open]/teams:rotate-90
                "
                aria-hidden="true"
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CreateTeamDialog size='icon-sm'>
            <Plus aria-hidden="true" />
            <span className="sr-only">Create team</span>
          </CreateTeamDialog>
        </div>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuSub>
                {TEAM_NAVIGATION_ITEMS.map((team) => {
                  const teamUrl = `/${workspaceSlug}/teams/${team.slug}`

                  const isActive =
                    pathname === teamUrl || pathname.startsWith(`${teamUrl}/`)

                  return (
                    <SidebarMenuSubItem key={team.id}>
                      <SidebarMenuSubButton asChild isActive={isActive}>
                        <Link
                          href={teamUrl}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <span className="truncate">{team.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
