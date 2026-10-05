'use client'

import { ListFilter, X } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'

import { Button } from '@/shared/ui/button'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import type { ProjectFilterOption } from '../model/project-filter.types'

interface ProjectFilterDropdownProps {
  readonly label: string
  readonly values: readonly string[]
  readonly options: readonly ProjectFilterOption[]
  readonly onToggle: (value: string) => void
}

const ProjectFilterDropdown = ({
  label,
  values,
  options,
  onToggle,
}: ProjectFilterDropdownProps) => {
  const count = values.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2.5"
        >
          {label}

          {count > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
            >
              {count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>

        <DropdownMenuSeparator />

        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={values.includes(option.value)}
            onCheckedChange={() => onToggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ProjectFiltersProps {
  readonly types: readonly string[]
  readonly stages: readonly string[]
  readonly priorities: readonly string[]
  readonly statuses: readonly string[]

  readonly typeOptions: readonly ProjectFilterOption[]
  readonly stageOptions: readonly ProjectFilterOption[]
  readonly priorityOptions: readonly ProjectFilterOption[]
  readonly statusOptions: readonly ProjectFilterOption[]

  readonly onToggleType: (value: string) => void

  readonly onToggleStage: (value: string) => void

  readonly onTogglePriority: (value: string) => void

  readonly onToggleStatus: (value: string) => void

  readonly onClear: () => void
}

export const ProjectFilters = ({
  types,
  stages,
  priorities,
  statuses,
  typeOptions,
  stageOptions,
  priorityOptions,
  statusOptions,
  onToggleType,
  onToggleStage,
  onTogglePriority,
  onToggleStatus,
  onClear,
}: ProjectFiltersProps) => {
  const hasFilters =
    types.length > 0 ||
    stages.length > 0 ||
    priorities.length > 0 ||
    statuses.length > 0

  return (
    <div className="flex items-center">
      <ListFilter aria-hidden="true" className="mr-1 size-3.5" />

      <ProjectFilterDropdown
        label="Type"
        values={types}
        options={typeOptions}
        onToggle={onToggleType}
      />

      <ProjectFilterDropdown
        label="Status"
        values={statuses}
        options={statusOptions}
        onToggle={onToggleStatus}
      />

      <ProjectFilterDropdown
        label="Stage"
        values={stages}
        options={stageOptions}
        onToggle={onToggleStage}
      />

      <ProjectFilterDropdown
        label="Priority"
        values={priorities}
        options={priorityOptions}
        onToggle={onTogglePriority}
      />

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onClear}
          aria-label="Clear project filters"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
