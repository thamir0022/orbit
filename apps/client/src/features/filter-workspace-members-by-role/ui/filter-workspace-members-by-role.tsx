'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { Role } from '@/entities/role'

type FilterWorkspaceMembersByRoleProps = {
  value: string
  roles: Role[]
  isLoading?: boolean
  onChange: (value: string) => void
}

export function FilterWorkspaceMembersByRole({
  value,
  roles,
  isLoading = false,
  onChange,
}: FilterWorkspaceMembersByRoleProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={onChange}
      disabled={isLoading}
    >
      <SelectTrigger className="h-11 w-full">
        <SelectValue
          placeholder={isLoading ? 'Loading roles...' : 'Filter by role'}
        />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All roles</SelectItem>

        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
