'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { workspaceMemberStatusOptions } from '../model/status-options'

type FilterWorkspaceMembersByStatusProps = {
  value: string
  onChange: (value: string) => void
}

export function FilterWorkspaceMembersByStatus({
  value,
  onChange,
}: FilterWorkspaceMembersByStatusProps) {
  return (
    <Select value={value || 'all'} onValueChange={onChange}>
      <SelectTrigger className="h-11 w-full">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>

      <SelectContent>
        {workspaceMemberStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
