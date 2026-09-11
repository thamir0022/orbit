'use client'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion'
import { Checkbox } from '@/shared/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '@/shared/ui/field'
import { ScrollArea } from '@/shared/ui/scroll-area'
import type { WorkspacePermission } from '@/entities/permission'
import {
  groupPermissionsByResource,
  prettifyLabel,
} from '../model/group-permissions'

type WorkspaceRolePermissionsSelectorProps = {
  permissions: WorkspacePermission[]
  value: string[]
  onChange: (permissionIds: string[]) => void
  disabled?: boolean
  loading?: boolean
  errorMessage?: string | null
}

export function WorkspaceRolePermissionsSelector({
  permissions,
  value,
  onChange,
  disabled = false,
  loading = false,
  errorMessage = null,
}: WorkspaceRolePermissionsSelectorProps) {
  const groups = groupPermissionsByResource(permissions)
  const selectedCount = value.length
  const totalCount = permissions.length

  function togglePermission(permissionId: string, checked: boolean) {
    if (checked) {
      onChange(Array.from(new Set([...value, permissionId])))
      return
    }

    onChange(value.filter((currentId) => currentId !== permissionId))
  }

  function clearAll() {
    onChange([])
  }

  function selectGroupPermissions(
    groupPermissionIds: string[],
    checked: boolean
  ) {
    if (checked) {
      onChange(Array.from(new Set([...value, ...groupPermissionIds])))
      return
    }

    onChange(
      value.filter((currentId) => !groupPermissionIds.includes(currentId))
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border p-4">
        Loading permissions...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-medium">Permissions</p>
          <p className="text-sm">
            Choose what this role can do in the workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{selectedCount} selected</Badge>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={disabled || selectedCount === 0}
          >
            Clear all
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border p-4 text-sm">{errorMessage}</div>
      ) : null}

      {groups.length === 0 ? (
        <div className="rounded-2xl border p-4 text-sm">
          No permissions available.
        </div>
      ) : (
        <ScrollArea className="h-[28rem] pr-4">
          <Accordion
            type="multiple"
            defaultValue={groups.map((group) => group.resource)}
          >
            {groups.map((group) => {
              const groupPermissionIds = group.permissions.map(
                (permission) => permission.id
              )
              const allSelected = groupPermissionIds.every((permissionId) =>
                value.includes(permissionId)
              )
              const partiallySelected =
                groupPermissionIds.some((permissionId) =>
                  value.includes(permissionId)
                ) && !allSelected

              return (
                <AccordionItem key={group.resource} value={group.resource}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between gap-3 pr-4">
                      <div className="text-left">
                        <p className="font-medium">
                          {prettifyLabel(group.resource)}
                        </p>
                        <p className="text-sm">
                          {group.permissions.length} permissions
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {partiallySelected ? (
                          <Badge variant="secondary">Partial</Badge>
                        ) : null}
                        {allSelected ? (
                          <Badge variant="secondary">Selected</Badge>
                        ) : null}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            selectGroupPermissions(
                              groupPermissionIds,
                              !allSelected
                            )
                          }}
                          disabled={disabled}
                        >
                          {allSelected ? 'Clear group' : 'Select group'}
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="grid gap-3">
                      {group.permissions.map((permission) => {
                        const checked = value.includes(permission.id)

                        return (
                          <Field key={permission.id}>
                            <FieldLabel className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(nextChecked) =>
                                  togglePermission(
                                    permission.id,
                                    nextChecked === true
                                  )
                                }
                                disabled={disabled}
                                className="mt-0.5"
                              />

                              <div className="min-w-0 space-y-1">
                                <div className="font-medium">
                                  {prettifyLabel(permission.action)}
                                </div>
                                <FieldDescription>
                                  {permission.description}
                                </FieldDescription>
                              </div>
                            </FieldLabel>
                          </Field>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </ScrollArea>
      )}
    </div>
  )
}
