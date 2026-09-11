'use client'

import { useMemo, useState } from 'react'
import { useWorkspaceRoles } from '@/entities/role'
import { useWorkspaceMembers } from '@/entities/workspace-member'
// import { getErrorMessage } from '@/shared/api/http-client'
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

export function WorkspaceMembersTable({
  workspaceId,
}: WorkspaceMembersTableProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('')
  const [roleId, setRoleId] = useState('')

  const debouncedSearch = useDebounce(searchInput, 350)

  const params = useMemo(
    () => ({
      page,
      limit,
      status: status || undefined,
      roleId: roleId || undefined,
      search: debouncedSearch.trim() || undefined,
    }),
    [page, limit, status, roleId, debouncedSearch]
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
    () => getWorkspaceMembersColumns({ roles, rolesLoading }),
    [roles, rolesLoading]
  )

  const members = membersResponse?.workspaceMembers ?? []
  const meta = membersResponse?.meta
  const totalPages = meta?.totalPages ?? 0
  const totalMembers = meta?.total ?? 0

  const hasFilters =
    Boolean(searchInput.trim()) ||
    Boolean(status) ||
    Boolean(roleId) ||
    limit !== 10

  function clearFilters() {
    setSearchInput('')
    setStatus('')
    setRoleId('')
    setLimit(10)
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatus(value)
    setPage(1)
  }

  function handleRoleChange(value: string) {
    setRoleId(value)
    setPage(1)
  }

  function handleLimitChange(value: number) {
    setLimit(value)
    setPage(1)
  }

  const errorMessage = error && 'Failed to load workspace members'
  // ? getErrorMessage(error, 'Failed to load workspace members')
  // : null

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Workspace members</h1>
            <p className="mt-1 text-sm">
              Manage and review all members in this workspace.
            </p>
          </div>

          <div className="rounded-2xl border px-4 py-3">
            <p className="text-xs uppercase tracking-wide">Total members</p>
            <p className="text-2xl font-semibold">{totalMembers}</p>
          </div>
        </div>
      </div>

      <MembersToolbar
        workspaceId={workspaceId}
        searchValue={searchInput}
        statusValue={status}
        roleValue={roleId}
        roles={roles}
        rolesLoading={rolesLoading}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onRoleChange={handleRoleChange}
        onClearFilters={clearFilters}
        showClearFilters={hasFilters}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">{isFetching ? 'Refreshing members...' : ' '}</p>

        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="members-limit">
            Rows per page
          </label>
          <select
            id="members-limit"
            value={limit}
            onChange={(event) => handleLimitChange(Number(event.target.value))}
            className="h-10 rounded-xl border px-3 text-sm outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {membersLoading ? <MembersTableSkeleton rows={limit} /> : null}

      {!membersLoading && errorMessage ? (
        <div className="rounded-2xl border px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      {!membersLoading && !errorMessage && members.length === 0 ? (
        <MembersEmptyState
          showReset={hasFilters}
          onReset={hasFilters ? clearFilters : undefined}
        />
      ) : null}

      {!membersLoading && !errorMessage && members.length > 0 ? (
        <div className="space-y-4">
          <WorkspaceMembersDataTable columns={columns} data={members} />
          <MembersPagination
            page={meta?.page ?? page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </section>
  )
}
