'use client'

import { useMemo } from 'react'
import {
  createColumnHelper,
  useTable,
  tableFeatures,
  rowSortingFeature,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { AlertCircle, Users } from 'lucide-react'

import { useTeamQuery } from '@/entities/team'
import { useTeamMembersQuery } from '@/entities/team/queries/use-team-members.query'
import type { TeamMember } from '@/entities/team/api/get-team-members.api'
import { getInitials } from '@/shared/lib/get-initials'
import { formatDate } from '@/shared/lib/format-date'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { TeamDetailHeader } from '@/widgets/team-detail/ui/team-detail-header'

interface TeamMembersPageProps {
  readonly teamKey: string
  readonly workspaceSlug: string
}

const memberTableFeatures = tableFeatures({ rowSortingFeature })
const columnHelper = createColumnHelper<
  typeof memberTableFeatures,
  TeamMember
>()
const columns = columnHelper.columns([
  columnHelper.accessor((member) => member.userId.displayName, {
    id: 'name',
    header: 'Member',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarImage src={row.original.userId.avatarUrl} alt="" />
          <AvatarFallback>
            {getInitials(row.original.userId.displayName)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.userId.displayName}</span>
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="capitalize">
        {getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor((member) => member.addedBy.displayName, {
    id: 'addedBy',
    header: 'Added by',
  }),
  columnHelper.accessor('joinedAt', {
    header: 'Joined',
    cell: ({ getValue }) => (
      <time dateTime={getValue()}>{formatDate(getValue())}</time>
    ),
  }),
])

function MembersTable({ members }: { readonly members: TeamMember[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const data = useMemo(() => members, [members])
  const table = useTable({
    key: 'team-members',
    features: memberTableFeatures,
    columns,
    data,
    state: { sorting },
    onSortingChange: setSorting,
  })

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="hidden md:block">
        <Table>
          <TableCaption className="sr-only">Team members</TableCaption>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="-ml-2"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.column.columnDef.header as string}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-2 p-3 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id} className="py-3">
            <CardContent className="flex items-center justify-between gap-3 px-4">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {row.original.userId.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {formatDate(row.original.joinedAt)}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {row.original.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function TeamMembersPage({
  teamKey,
  workspaceSlug,
}: TeamMembersPageProps) {
  const teamQuery = useTeamQuery(teamKey)
  const membersQuery = useTeamMembersQuery(teamKey)

  if (teamQuery.isPending)
    return (
      <div className="w-full space-y-4 p-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  if (teamQuery.isError || !teamQuery.data)
    return (
      <Alert variant="destructive" role="alert">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Unable to load team</AlertTitle>
      </Alert>
    )

  return (
    <main className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <TeamDetailHeader
        team={teamQuery.data}
        workspaceSlug={workspaceSlug}
        activeTab="members"
      />
      <section
        aria-labelledby="members-heading"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="mb-4">
          <h2 id="members-heading" className="text-lg font-semibold">
            Members
          </h2>
          <p className="text-sm text-muted-foreground">
            People working with this team.
          </p>
        </div>
        {membersQuery.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : membersQuery.isError ? (
          <Alert variant="destructive" role="alert">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Unable to load members</AlertTitle>
            <AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void membersQuery.refetch()}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : membersQuery.data?.length ? (
          <MembersTable members={membersQuery.data} />
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No members yet</EmptyTitle>
              <EmptyDescription>
                Team members will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </main>
  )
}
