'use client'

import { useMemo, useState } from 'react'

import { useWorkspaceRoles } from '@/entities/role'

import { getWorkspaceRolesColumns } from '../model/columns'
import { RolesEmptyState } from './roles-empty-state'
import { RolesTableSkeleton } from './roles-table-skeleton'
import { RolesToolbar } from './roles-toolbar'
import { WorkspaceRolesDataTable } from './workspace-roles-data-table'

type WorkspaceRolesTableProps = {
  workspaceId: string
}

export function WorkspaceRolesTable({ workspaceId }: WorkspaceRolesTableProps) {
  const [search, setSearch] = useState('')

  const rolesQuery = useWorkspaceRoles(workspaceId)

  const roles = rolesQuery.data ?? []

  const columns = useMemo(
    () => getWorkspaceRolesColumns({ workspaceId }),
    [workspaceId]
  )

  const hasSearch = search.trim().length > 0

  const emptyState = hasSearch ? (
    <RolesEmptyState
      showReset
      onReset={() => setSearch('')}
      title="No roles match your search"
      description="Try a different keyword or clear the search."
    />
  ) : null

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Workspace roles</h1>

          <p className="text-sm text-muted-foreground">
            Manage custom roles, permission sets, and access rules.
          </p>
        </div>
      </div>

      <RolesToolbar
        workspaceId={workspaceId}
        searchValue={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch('')}
        showClearSearch={hasSearch}
      />

      {rolesQuery.isLoading ? <RolesTableSkeleton rows={6} /> : null}

      {!rolesQuery.isLoading && rolesQuery.isError ? (
        <div className="rounded-2xl border p-4 text-sm">
          Failed to load roles
        </div>
      ) : null}

      {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 ? (
        <RolesEmptyState
          title="No roles yet"
          description="Create your first custom role to get started."
        />
      ) : null}

      {!rolesQuery.isLoading && !rolesQuery.isError && roles.length > 0 ? (
        <WorkspaceRolesDataTable
          columns={columns}
          data={roles}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyState={emptyState}
        />
      ) : null}
    </section>
  )
}
