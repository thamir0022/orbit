'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import { formatTypeLabel } from '@/entities/workspace/lib/utils'
import { CompanySize, CompanyType } from '@/entities/workspace'
import { useEditWorkspaceMutation } from '../model/use-edit-workspace.mutation'

type WorkspaceFormData = {
  name: string
  slug: string
  companyType: CompanyType | ''
  companySize: CompanySize | ''
  defaultPointsPerMemberPerDay: number
  defaultHoursPerDay: number
  defaultWorkingDaysPerWeek: number
  defaultWorkingDaysPerSprint: number
}

const getWorkspaceFormData = (
  workspace: ReturnType<typeof useWorkspace> | null
): WorkspaceFormData => ({
  name: workspace?.name ?? '',
  slug: workspace?.slug ?? '',
  companyType: workspace?.companyType ?? '',
  companySize: workspace?.companySize ?? '',
  defaultPointsPerMemberPerDay:
    workspace?.settings?.defaultPointsPerMemberPerDay ?? 0,
  defaultHoursPerDay: workspace?.settings?.defaultHoursPerDay ?? 0,
  defaultWorkingDaysPerWeek:
    workspace?.settings?.defaultWorkingDaysPerWeek ?? 0,
  defaultWorkingDaysPerSprint:
    workspace?.settings?.defaultWorkingDaysPerSprint ?? 0,
})

export const WorkspaceSettings = () => {
  const workspace = useWorkspace()
  const { mutateAsync: editWorkspace, isPending } = useEditWorkspaceMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<WorkspaceFormData>(() =>
    getWorkspaceFormData(workspace)
  )

  useEffect(() => {
    setFormData(getWorkspaceFormData(workspace))
  }, [workspace])

  const handleTextChange =
    (field: 'name' | 'slug') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const handleNumberChange =
    (
      field:
        | 'defaultPointsPerMemberPerDay'
        | 'defaultHoursPerDay'
        | 'defaultWorkingDaysPerWeek'
        | 'defaultWorkingDaysPerSprint'
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value

      setFormData((prev) => ({
        ...prev,
        [field]: value === '' ? 0 : Number(value),
      }))
    }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData(getWorkspaceFormData(workspace))
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      await editWorkspace({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        companyType: formData.companyType || undefined,
        companySize: formData.companySize || undefined,
        settings: {
          defaultPointsPerMemberPerDay: formData.defaultPointsPerMemberPerDay,
          defaultHoursPerDay: formData.defaultHoursPerDay,
          defaultWorkingDaysPerWeek: formData.defaultWorkingDaysPerWeek,
          defaultWorkingDaysPerSprint: formData.defaultWorkingDaysPerSprint,
        },
      })

      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update workspace', error)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="text-muted-foreground text-sm">
          Manage your workspace details and defaults.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              value={formData.name}
              readOnly={!isEditing}
              onChange={handleTextChange('name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Workspace Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              readOnly={!isEditing}
              onChange={handleTextChange('slug')}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyType">Company Type</Label>

              <Select
                value={formData.companyType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyType: value as CompanyType,
                  }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger id="companyType">
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>

                <SelectContent>
                  {Object.values(CompanyType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>

              <Select
                value={formData.companySize}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    companySize: value as CompanySize,
                  }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger id="companySize">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>

                <SelectContent>
                  {Object.values(CompanySize).map((size) => (
                    <SelectItem key={size} value={size}>
                      {formatTypeLabel(size)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="mb-6">
            <h2 className="font-medium">Default Values</h2>
            <p className="text-muted-foreground text-sm">
              Configure workspace-wide planning defaults.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultPointsPerMemberPerDay">
                Points Per Member / Day
              </Label>
              <Input
                id="defaultPointsPerMemberPerDay"
                type="number"
                value={formData.defaultPointsPerMemberPerDay}
                readOnly={!isEditing}
                onChange={handleNumberChange('defaultPointsPerMemberPerDay')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultHoursPerDay">Hours Per Day</Label>
              <Input
                id="defaultHoursPerDay"
                type="number"
                value={formData.defaultHoursPerDay}
                readOnly={!isEditing}
                onChange={handleNumberChange('defaultHoursPerDay')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultWorkingDaysPerWeek">
                Working Days Per Week
              </Label>
              <Input
                id="defaultWorkingDaysPerWeek"
                type="number"
                value={formData.defaultWorkingDaysPerWeek}
                readOnly={!isEditing}
                onChange={handleNumberChange('defaultWorkingDaysPerWeek')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultWorkingDaysPerSprint">
                Working Days Per Sprint
              </Label>
              <Input
                id="defaultWorkingDaysPerSprint"
                type="number"
                value={formData.defaultWorkingDaysPerSprint}
                readOnly={!isEditing}
                onChange={handleNumberChange('defaultWorkingDaysPerSprint')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t pt-6">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button onClick={handleEdit}>Edit Workspace</Button>
          )}
        </div>
      </div>
    </div>
  )
}
