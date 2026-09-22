'use client'

import { useMemo, useState } from 'react'

import { useWorkspaceRoles } from '@/entities/role'
import { useWorkspaceMembers } from '@/entities/workspace-member'
import { useDebounce } from '@/shared/lib/use-debounce'

import { getWorkspaceMembersColumns } from '../model/columns'
import { MembersEmptyState } from './members-empty-state'
import { MembersPagination } from './members-pagination'
import { MembersTableSkeleton } from './members-table-skeleton'
import { MembersToolbar } from './members-toolbar'
import { WorkspaceMembersDataTable } from './workspace-members-data-table'

type WorkspaceMembersTableProps = {
  workspaceId: string
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export function WorkspaceMembersTable({
  workspaceId,
}: WorkspaceMembersTableProps) {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [roleId, setRoleId] = useState('')

  const debouncedSearch = useDebounce(search, 350)

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      status: status || undefined,
      roleId: roleId || undefined,
    }),
    [page, limit, debouncedSearch, status, roleId]
  )

  const {
    data: membersResponse,
    isLoading: membersLoading,
    isFetching,
    error,
  } = useWorkspaceMembers(workspaceId, params)

  const { data: roles = [], isLoading: rolesLoading } =
    useWorkspaceRoles(workspaceId)

  const columns = useMemo(
    () =>
      getWorkspaceMembersColumns({
        roles,
        rolesLoading,
      }),
    [roles, rolesLoading]
  )

  const members = membersResponse?.workspaceMembers ?? []
  const meta = membersResponse?.meta

  const currentPage = meta?.page ?? page
  const totalPages = meta?.totalPages ?? 0
  const totalMembers = meta?.total ?? 0

  const hasFilters =
    search.trim().length > 0 || Boolean(status) || Boolean(roleId)

  function resetFilters() {
    setSearch('')
    setStatus('')
    setRoleId('')
    setPage(DEFAULT_PAGE)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(DEFAULT_PAGE)
  }

  function handleStatusChange(value: string) {
    setStatus(value)
    setPage(DEFAULT_PAGE)
  }

  function handleRoleChange(value: string) {
    setRoleId(value)
    setPage(DEFAULT_PAGE)
  }

  function handleLimitChange(value: number) {
    setLimit(value)
    setPage(DEFAULT_PAGE)
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Workspace members
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage and review all members in this workspace.
            </p>
          </div>

          <div className="rounded-2xl border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total members
            </p>

            <p className="text-2xl font-semibold tabular-nums">
              {totalMembers}
            </p>
          </div>
        </div>
      </header>

      <MembersToolbar
        workspaceId={workspaceId}
        searchValue={search}
        statusValue={status}
        roleValue={roleId}
        roles={roles}
        rolesLoading={rolesLoading}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onRoleChange={handleRoleChange}
        onClearFilters={resetFilters}
        showClearFilters={hasFilters}
      />

      <div className="flex min-h-10 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {isFetching && !membersLoading
            ? 'Updating members…'
            : `${members.length} members`}
        </p>

        <div className="flex items-center gap-2">
          <label
            htmlFor="members-limit"
            className="text-sm text-muted-foreground"
          >
            Rows
          </label>

          <select
            id="members-limit"
            value={limit}
            onChange={(event) => handleLimitChange(Number(event.target.value))}
            className="h-9 rounded-lg border bg-background px-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {membersLoading ? (
        <MembersTableSkeleton rows={limit} />
      ) : error ? (
        <div className="rounded-2xl border px-4 py-3 text-sm text-destructive">
          Failed to load workspace members.
        </div>
      ) : members.length === 0 ? (
        <MembersEmptyState
          showReset={hasFilters}
          onReset={hasFilters ? resetFilters : undefined}
        />
      ) : (
        <div className="space-y-4">
          <WorkspaceMembersDataTable columns={columns} data={members} />

          <MembersPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </section>
  )
}
