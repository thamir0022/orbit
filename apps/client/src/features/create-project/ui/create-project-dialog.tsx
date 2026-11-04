'use client'

import { useId, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  CircleGauge,
  MoveRight,
  Plus,
  Settings2,
  Target,
  Users,
} from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import {
  ProjectPriority,
  ProjectStage,
  ProjectType,
} from '@/entities/project/model/project.types'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'

import { FileUploadField } from '@/features/file-upload/ui/file-upload-field'
import { useFileUploadQueue } from '@/features/file-upload/model/use-file-upload-queue'

import { cn } from '@/shared/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/shared/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Separator } from '@/shared/ui/separator'
import { Spinner } from '@/shared/ui/spinner'

import {
  buildCreateProjectRequest,
  formatDateLabel,
  formatDateValue,
  formatEnumLabel,
  parseDateValue,
} from '../lib/create-project.utils'
import {
  CreateProjectSchema,
  type CreateProjectFormValues,
} from '../model/create-project.schema'
import { useCreateProjectMutation } from '../model/use-create-project.mutation'

interface ProjectComboboxFieldProps<T extends string> {
  readonly id: string
  readonly label: string
  readonly value: T | undefined
  readonly options: readonly T[]
  readonly placeholder: string
  readonly invalid: boolean
  readonly icon: React.ReactNode
  readonly onChange: (value: T) => void
}

interface ProjectDateFieldProps {
  readonly id: string
  readonly label: string
  readonly value?: string
  readonly invalid: boolean
  readonly minDate?: string
  readonly maxDate?: string
  readonly onChange: (value: string) => void
}

const PROJECT_TYPE_OPTIONS = Object.values(ProjectType)
const PROJECT_STAGE_OPTIONS = Object.values(ProjectStage)
const PROJECT_PRIORITY_OPTIONS = Object.values(ProjectPriority)

/** Compact enum selector used by the project form. */
function ProjectComboboxField<T extends string>({
  id,
  label,
  value,
  options,
  placeholder,
  invalid,
  icon,
  onChange,
}: ProjectComboboxFieldProps<T>) {
  const displayValue = value ? formatEnumLabel(value) : placeholder

  return (
    <Combobox
      items={options}
      value={value ?? null}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onChange(nextValue)
      }}
      itemToStringValue={formatEnumLabel}
    >
      <ComboboxTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            aria-label={`${label}: ${displayValue}`}
            aria-invalid={invalid}
            className={cn(
              'h-8 justify-start gap-1.5 rounded-full px-2.5',
              'font-normal shadow-none hover:bg-accent',
              'focus-visible:ring-1',
              invalid && 'border-destructive'
            )}
          >
            <span aria-hidden="true" className="flex shrink-0 items-center">
              {icon}
            </span>

            <ComboboxValue placeholder={placeholder}>
              {displayValue}
            </ComboboxValue>
          </Button>
        }
      />

      <ComboboxContent align="start" side="bottom" className="w-64">
        <div className="p-2">
          <ComboboxInput
            placeholder={`Search ${label.toLowerCase()}`}
            showTrigger={false}
            showClear
            className="h-8"
            autoComplete="off"
            aria-label={`Search ${label.toLowerCase()}`}
          />
        </div>

        <ComboboxEmpty>No {label.toLowerCase()} found.</ComboboxEmpty>

        <ComboboxList className="max-h-52 overflow-y-auto">
          {(option) => (
            <ComboboxItem key={option} value={option}>
              {formatEnumLabel(option)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

/** Date selector supporting start and target-date boundaries. */
function ProjectDateField({
  id,
  label,
  value,
  invalid,
  minDate,
  maxDate,
  onChange,
}: ProjectDateFieldProps) {
  const [open, setOpen] = useState(false)

  const selectedDate = parseDateValue(value)
  const minimumDate = parseDateValue(minDate)
  const maximumDate = parseDateValue(maxDate)

  const disabledDates = [
    ...(minimumDate ? [{ before: minimumDate }] : []),
    ...(maximumDate ? [{ after: maximumDate }] : []),
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          size="sm"
          aria-invalid={invalid}
          aria-haspopup="dialog"
          aria-label={
            value
              ? `${label}: ${formatDateLabel(value)}`
              : `Set ${label.toLowerCase()}`
          }
          className={cn(
            'h-8 justify-start gap-1.5 rounded-full px-2.5',
            'font-normal shadow-none hover:bg-accent',
            'focus-visible:ring-1',
            invalid && 'border-destructive'
          )}
        >
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
          {value ? formatDateLabel(value) : label}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          disabled={disabledDates.length > 0 ? disabledDates : undefined}
          onSelect={(date) => {
            if (!date) return

            onChange(formatDateValue(date))
            setOpen(false)
          }}
        />

        {value && (
          <>
            <Separator />

            <div className="p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
              >
                Clear date
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** Placeholder until the project lead selector is enabled. */
function ProjectLeadField({ id }: { readonly id: string }) {
  return (
    <Button
      id={id}
      type="button"
      variant="outline"
      size="sm"
      disabled
      aria-label="Project lead: No lead assigned"
      className="h-8 rounded-full px-2.5 font-normal opacity-100"
    >
      <Users className="size-3.5 shrink-0" aria-hidden="true" />
      No lead
    </Button>
  )
}

/** Creates a project and attaches selected files after creation. */
export function CreateProjectDialog() {
  const workspace = useWorkspace()
  const createProjectMutation = useCreateProjectMutation()

  const {
    items,
    validationErrors,
    addFiles,
    removeFile,
    resetQueue,
    uploadAll,
  } = useFileUploadQueue()

  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)

  const titleId = useId()
  const descriptionId = useId()
  const nameId = useId()
  const projectDescriptionId = useId()
  const typeId = useId()
  const stageId = useId()
  const priorityId = useId()
  const leadId = useId()
  const startDateId = useId()
  const targetEndDateId = useId()

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      type: undefined,
      stage: undefined,
      priority: undefined,
      startDate: undefined,
      targetEndDate: undefined,
    },
    mode: 'onTouched',
  })

  const startDate = useWatch({
    control,
    name: 'startDate',
  })

  const targetEndDate = useWatch({
    control,
    name: 'targetEndDate',
  })

  const closeDialog = () => {
    if (isSubmitting) return

    setOpen(false)
    setCreatedProjectId(null)
    reset()
    clearErrors()
    resetQueue()
  }

  const onSubmit = async (values: CreateProjectFormValues) => {
    clearErrors('root.serverError')

    if (!workspace?.id) {
      setError('root.serverError', {
        message:
          'Workspace context is unavailable. Please refresh and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      let projectId = createdProjectId

      // Create once. Retrying attachments must not create another project.
      if (!projectId) {
        const response = await createProjectMutation.mutateAsync(
          buildCreateProjectRequest(values)
        )

        projectId = response.project.id
        setCreatedProjectId(projectId)
      }

      const result = await uploadAll({
        targetType: 'project',
        targetId: projectId,
      })

      if (result.failed > 0) {
        setError('root.serverError', {
          message:
            `Project created successfully, but ${result.failed} ` +
            `attachment(s) could not be added. Retry the failed files.`,
        })
        return
      }

      setOpen(false)
      setCreatedProjectId(null)
      reset()
      resetQueue()
    } catch (error: unknown) {
      setError('root.serverError', {
        message:
          error instanceof Error
            ? error.message
            : createdProjectId
              ? 'Project created, but attaching files failed.'
              : 'Failed to create the project.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const serverError = errors.root?.serverError
  const hasCreatedProject = createdProjectId !== null

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) return

        if (nextOpen) {
          setOpen(true)
        } else {
          closeDialog()
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost">
            <Plus aria-hidden="true" />
            New Project
          </Button>
        }
      />

      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          'flex max-h-[85dvh] w-full max-w-3xl! flex-col',
          'gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl'
        )}
      >
        <DialogHeader>
          <DialogTitle id={titleId} className="sr-only">
            New project
          </DialogTitle>

          <DialogDescription id={descriptionId} className="sr-only">
            Create a new project in the current workspace.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-project-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="New project form"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <fieldset
            disabled={isSubmitting || hasCreatedProject}
            className="min-w-0"
          >
            <div className="p-3">
              <FieldGroup>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel htmlFor={nameId} className="sr-only">
                        Project name
                      </FieldLabel>

                      <Input
                        {...field}
                        id={nameId}
                        autoFocus
                        autoComplete="off"
                        placeholder="Project name"
                        required
                        aria-required="true"
                        aria-invalid={fieldState.invalid}
                        className={cn(
                          'max-w-full w-fit! border-none!',
                          'bg-transparent! text-2xl! font-semibold!',
                          'field-sizing-content focus-visible:ring-0'
                        )}
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <div
                role="group"
                aria-label="Project properties"
                className="mt-4 flex flex-wrap items-center gap-2"
              >
                <Controller
                  name="stage"
                  control={control}
                  render={({ field, fieldState }) => (
                    <ProjectComboboxField
                      id={stageId}
                      label="Stage"
                      value={field.value}
                      options={PROJECT_STAGE_OPTIONS}
                      placeholder="Stage"
                      invalid={fieldState.invalid}
                      icon={<Target className="size-3.5" />}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="priority"
                  control={control}
                  render={({ field, fieldState }) => (
                    <ProjectComboboxField
                      id={priorityId}
                      label="Priority"
                      value={field.value}
                      options={PROJECT_PRIORITY_OPTIONS}
                      placeholder="No priority"
                      invalid={fieldState.invalid}
                      icon={<CircleGauge className="size-3.5" />}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <ProjectComboboxField
                      id={typeId}
                      label="Type"
                      value={field.value}
                      options={PROJECT_TYPE_OPTIONS}
                      placeholder="Type"
                      invalid={fieldState.invalid}
                      icon={<Settings2 className="size-3.5" />}
                      onChange={field.onChange}
                    />
                  )}
                />

                <ProjectLeadField id={leadId} />

                <Controller
                  name="startDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <ProjectDateField
                      id={startDateId}
                      label="Start"
                      value={field.value}
                      invalid={fieldState.invalid}
                      maxDate={targetEndDate}
                      onChange={field.onChange}
                    />
                  )}
                />

                <MoveRight
                  size={15}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />

                <Controller
                  name="targetEndDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <ProjectDateField
                      id={targetEndDateId}
                      label="Target"
                      value={field.value}
                      invalid={fieldState.invalid}
                      minDate={startDate}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <Separator className="mt-4" />

            <div className="p-3">
              <Field data-invalid={!!errors.description} className="gap-1">
                <FieldLabel htmlFor={projectDescriptionId} className="sr-only">
                  Project description
                </FieldLabel>

                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        {...field}
                        id={projectDescriptionId}
                        placeholder="Write a description, a project brief, or collect ideas..."
                        aria-label="Project description"
                        aria-invalid={fieldState.invalid}
                        className={cn(
                          'w-full border-none bg-transparent!',
                          'focus-visible:ring-0'
                        )}
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
              </Field>
            </div>
          </fieldset>

          <div className="px-3 pb-3">
            <FileUploadField
              items={items}
              errors={validationErrors}
              disabled={isSubmitting}
              onFilesSelected={addFiles}
              onRemove={removeFile}
            />

            {hasCreatedProject && !serverError && (
              <p className="mt-3 text-xs text-muted-foreground">
                Project created. Finalizing attachments.
              </p>
            )}

            {serverError && (
              <Alert variant="destructive" className="mt-4" role="alert">
                <AlertTitle>
                  {hasCreatedProject
                    ? 'Attachment upload incomplete'
                    : 'Unable to create project'}
                </AlertTitle>

                <AlertDescription>{serverError.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>

        <DialogFooter className="shrink-0 border-t px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={closeDialog}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-project-form"
            disabled={isSubmitting || (!hasCreatedProject && !isValid)}
            aria-busy={isSubmitting}
          >
            {isSubmitting && (
              <Spinner aria-hidden="true" data-icon="inline-start" />
            )}

            {hasCreatedProject ? 'Retry attachments' : 'Create project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
