'use client'

import { useMemo, useState } from 'react'
import { useWorkspaceRoles } from '@/entities/role'
import { getWorkspaceRolesColumns } from '../model/columns'
import { RolesToolbar } from './roles-toolbar'
import { RolesEmptyState } from './roles-empty-state'
import { RolesTableSkeleton } from './roles-table-skeleton'
import { WorkspaceRolesDataTable } from './workspace-roles-data-table'

type WorkspaceRolesTableProps = {
  workspaceId: string
}

export function WorkspaceRolesTable({ workspaceId }: WorkspaceRolesTableProps) {
  const [search, setSearch] = useState('')

  const rolesQuery = useWorkspaceRoles(workspaceId)

  const roles = useMemo(() => {
    const items = rolesQuery.data ?? []

    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return items
    }

    return items.filter((role) => {
      const name = role.name.toLowerCase()
      const description = (role.description ?? '').toLowerCase()

      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      )
    })
  }, [rolesQuery.data, search])

  const columns = useMemo(
    () => getWorkspaceRolesColumns({ workspaceId }),
    [workspaceId]
  )

  const errorMessage = rolesQuery.error ? 'Failed to load roles' : null

  const showClearSearch = Boolean(search.trim())

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Workspace roles</h1>
          <p className="text-sm">
            Manage custom roles, permission sets, and access rules.
          </p>
        </div>
      </div>

      <RolesToolbar
        workspaceId={workspaceId}
        searchValue={search}
        onSearchChange={(value) => setSearch(value)}
        onClearSearch={() => setSearch('')}
        showClearSearch={showClearSearch}
      />

      {rolesQuery.isLoading ? <RolesTableSkeleton rows={6} /> : null}

      {!rolesQuery.isLoading && errorMessage ? (
        <div className="rounded-2xl border p-4 text-sm">{errorMessage}</div>
      ) : null}

      {!rolesQuery.isLoading && !errorMessage && roles.length === 0 ? (
        <RolesEmptyState
          showReset={showClearSearch}
          onReset={showClearSearch ? () => setSearch('') : undefined}
          title={showClearSearch ? 'No roles match your search' : undefined}
          description={
            showClearSearch
              ? 'Try a different keyword or clear the search.'
              : 'Create your first custom role to get started.'
          }
        />
      ) : null}

      {!rolesQuery.isLoading && !errorMessage && roles.length > 0 ? (
        <WorkspaceRolesDataTable columns={columns} data={roles} />
      ) : null}
    </section>
  )
}
