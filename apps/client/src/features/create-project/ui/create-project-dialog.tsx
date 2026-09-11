'use client'

import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Textarea } from '@/shared/ui/textarea'
import {
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  type CreateProjectInput,
  type ProjectResource,
} from '@/entities/project/model/types'
import { useCreateWorkspaceProject } from '@/entities/project/model/project.queries'

type FormValues = {
  name: string
  key: string
  description?: string
  resources: ProjectResource[]
  avatarUrl?: string
  startDate?: string
  targetEndDate?: string
  type?: CreateProjectInput['type']
  priority?: CreateProjectInput['priority']
  leadId?: string
}

interface CreateProjectDialogProps {
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultValues: FormValues = {
  name: '',
  key: '',
  description: '',
  resources: [{ name: '', url: '' }],
  avatarUrl: '',
  startDate: '',
  targetEndDate: '',
  type: undefined,
  priority: 'medium',
  leadId: '',
}

export function CreateProjectDialog({
  workspaceId,
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const form = useForm<FormValues>({
    defaultValues,
    mode: 'onSubmit',
  })

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'resources',
  })

  const createProjectMutation = useCreateWorkspaceProject(workspaceId)

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
    }
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    const resources = values.resources
      .map((resource) => ({
        name: resource.name.trim(),
        url: resource.url.trim(),
      }))
      .filter((resource) => resource.name || resource.url)

    const payload: CreateProjectInput = {
      name: values.name.trim(),
      key: values.key.trim(),
      description: values.description?.trim() || undefined,
      resources: resources.length ? resources : undefined,
      avatarUrl: values.avatarUrl?.trim() || undefined,
      startDate: values.startDate || undefined,
      targetEndDate: values.targetEndDate || undefined,
      type: values.type || undefined,
      priority: values.priority || undefined,
      leadId: values.leadId?.trim() || undefined,
    }

    await createProjectMutation.mutateAsync(payload)
    onOpenChange(false)
    reset(defaultValues)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className='text-center'>Create project</DialogTitle>
          <DialogDescription>
            Add a new workspace project in a clean, structured form.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
          <ScrollArea className="max-h-[calc(92vh-200px)]">
            <div className="space-y-8 px-6 py-6">
              <section className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Project name</Label>
                  <Input
                    id="name"
                    placeholder="Website redesign"
                    {...register('name', {
                      required: 'Project name is required',
                      minLength: {
                        value: 3,
                        message: 'Minimum 3 characters',
                      },
                      maxLength: {
                        value: 100,
                        message: 'Maximum 100 characters',
                      },
                    })}
                  />
                  {errors.name ? (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key">Project key</Label>
                  <Input
                    id="key"
                    placeholder="WEB1"
                    {...register('key', {
                      required: 'Project key is required',
                      minLength: {
                        value: 2,
                        message: 'Minimum 2 characters',
                      },
                      maxLength: {
                        value: 10,
                        message: 'Maximum 10 characters',
                      },
                      pattern: {
                        value: /^[A-Z][A-Z0-9]*$/,
                        message:
                          'Use uppercase letters and numbers only, starting with a letter',
                      },
                      onChange: (event) => {
                        const normalized = event.target.value
                          .toUpperCase()
                          .replace(/\s+/g, '')
                          .replace(/[^A-Z0-9]/g, '')
                        setValue('key', normalized, { shouldValidate: true })
                      },
                    })}
                  />
                  {errors.key ? (
                    <p className="text-sm text-destructive">
                      {errors.key.message}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Example: <span className="font-medium">WEB1</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Short summary of the project"
                    className="min-h-24"
                    {...register('description', {
                      maxLength: {
                        value: 1000,
                        message: 'Maximum 1000 characters',
                      },
                    })}
                  />
                  {errors.description ? (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Project type</Label>
                  <Select
                    value={form.watch('type') || ''}
                    onValueChange={(value) =>
                      setValue('type', value as CreateProjectInput['type'], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={form.watch('priority') || 'medium'}
                    onValueChange={(value) =>
                      setValue(
                        'priority',
                        value as CreateProjectInput['priority'],
                        {
                          shouldValidate: true,
                        }
                      )
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetEndDate">Target end date</Label>
                  <Input
                    id="targetEndDate"
                    type="date"
                    {...register('targetEndDate')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://..."
                    {...register('avatarUrl', {
                      maxLength: {
                        value: 2048,
                        message: 'Maximum 2048 characters',
                      },
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadId">Lead ID</Label>
                  <Input
                    id="leadId"
                    placeholder="Optional workspace member ID"
                    {...register('leadId')}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium">Resources</h3>
                    <p className="text-sm text-muted-foreground">
                      Add links related to this project.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', url: '' })}
                    disabled={fields.length >= 20}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add resource
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-2xl border bg-muted/20 p-4 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`resources.${index}.name`}>Name</Label>
                        <Input
                          id={`resources.${index}.name`}
                          placeholder="Design doc"
                          {...register(`resources.${index}.name` as const, {
                            maxLength: {
                              value: 100,
                              message: 'Maximum 100 characters',
                            },
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`resources.${index}.url`}>URL</Label>
                        <Input
                          id={`resources.${index}.url`}
                          placeholder="https://..."
                          {...register(`resources.${index}.url` as const)}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createProjectMutation.isPending}
            >
              {createProjectMutation.isPending
                ? 'Creating...'
                : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
