'use client'

import { Input } from '@/shared/ui/input'

type SearchWorkspaceMembersProps = {
  value: string
  onChange: (value: string) => void
}

export function SearchWorkspaceMembers({
  value,
  onChange,
}: SearchWorkspaceMembersProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search members"
      type="search"
      className="h-11 w-full"
    />
  )
}
