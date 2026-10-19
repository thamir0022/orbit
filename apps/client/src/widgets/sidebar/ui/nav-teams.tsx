'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
import { useTeamsQuery } from '@/entities/team'
import { Spinner } from '@/shared/ui/spinner'

interface NavTeamsProps {
  readonly workspaceSlug: string
}

export function NavTeams({ workspaceSlug }: NavTeamsProps) {
  const pathname = usePathname()
  const { data: teams = [], isLoading } = useTeamsQuery()

  const teamRoutePrefix = `/${workspaceSlug}/teams/`

  const routeTeamKey = pathname.startsWith(teamRoutePrefix)
    ? pathname.slice(teamRoutePrefix.length).split('/')[0] || null
    : null

  return (
    <Collapsible
      key={routeTeamKey ?? 'no-active-team'}
      defaultOpen={routeTeamKey !== null}
      className="group/teams"
    >
      <SidebarGroup>
        <div className="flex items-center gap-1 px-2">
          <SidebarGroupLabel asChild className="min-w-0 flex-1">
            <CollapsibleTrigger aria-label="Toggle teams" className="w-full">
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

          <CreateTeamDialog size="icon-sm">
            <Plus aria-hidden="true" />
            <span className="sr-only">Create team</span>
          </CreateTeamDialog>
        </div>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuSub>
                {isLoading ? (
                  <Spinner />
                ) : (
                  teams.map((team) => {
                    const teamUrl = `${teamRoutePrefix}${team.key}`
                    const isActive =
                      pathname === teamUrl || pathname.startsWith(`${teamUrl}/`)

                    return (
                      <SidebarMenuSubItem key={team.key}>
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
                  })
                )}
              </SidebarMenuSub>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
