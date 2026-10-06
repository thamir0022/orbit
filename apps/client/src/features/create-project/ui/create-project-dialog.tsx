'use client'

import { useEffect, useId, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  CircleDot,
  GitBranch,
  Layers3,
  MoveRight,
  Plus,
  Users,
} from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import {
  ProjectPriority,
  ProjectStage,
  ProjectType,
} from '@/entities/project/model/project.types'

import { useWorkspace } from '@/entities/workspace/model/workspace.store'

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
import { cn } from '@/shared/lib/utils'

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

const ProjectComboboxField = <T extends string>({
  id,
  label,
  value,
  options,
  placeholder,
  invalid,
  icon,
  onChange,
}: ProjectComboboxFieldProps<T>) => {
  const displayValue = value ? formatEnumLabel(value) : placeholder

  return (
    <Combobox
      items={options}
      value={value ?? null}
      onValueChange={(nextValue) => {
        if (nextValue !== null) {
          onChange(nextValue)
        }
      }}
      itemToStringValue={(item) => formatEnumLabel(item)}
    >
      <ComboboxTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            className={[
              'h-8 rounded-full px-2.5',
              'justify-start gap-1.5',
              'font-normal',
              'shadow-none',
              'hover:bg-accent',
              'focus-visible:ring-1',
              invalid ? 'border-destructive' : '',
            ].join(' ')}
            aria-label={`${label}: ${displayValue}`}
            aria-invalid={invalid}
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

const ProjectDateField = ({
  id,
  label,
  value,
  invalid,
  minDate,
  maxDate,
  onChange,
}: ProjectDateFieldProps) => {
  const [open, setOpen] = useState(false)

  const selectedDate = parseDateValue(value)
  const minimumDate = parseDateValue(minDate)
  const maximumDate = parseDateValue(maxDate)

  const bookedDates = [
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
          className={[
            'h-8 rounded-full px-2.5',
            'justify-start gap-1.5',
            'font-normal',
            'shadow-none',
            'hover:bg-accent',
            'focus-visible:ring-1',
            invalid ? 'border-destructive' : '',
          ].join(' ')}
          aria-label={
            value
              ? `${label}: ${formatDateLabel(value)}`
              : `Set ${label.toLowerCase()}`
          }
          aria-invalid={invalid}
          aria-haspopup="dialog"
        >
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />

          <span>{value ? formatDateLabel(value) : label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          disabled={bookedDates.length > 0 ? bookedDates : undefined}
          onSelect={(nextDate) => {
            if (!nextDate) {
              return
            }

            onChange(formatDateValue(nextDate))
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

const ProjectLeadField = ({ id }: { readonly id: string }) => {
  return (
    <Button
      id={id}
      type="button"
      variant="outline"
      size="sm"
      disabled
      className="h-8 rounded-full px-2.5 font-normal opacity-100"
      aria-label="Project lead: No lead assigned"
    >
      <Users className="size-3.5 shrink-0" aria-hidden="true" />
      No lead
    </Button>
  )
}

export const CreateProjectDialog = () => {
  const workspace = useWorkspace()
  const createProjectMutation = useCreateProjectMutation()

  const [open, setOpen] = useState(false)

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

  const form = useForm<CreateProjectFormValues>({
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

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = form

  const startDate = useWatch({
    control,
    name: 'startDate',
  })

  const targetEndDate = useWatch({
    control,
    name: 'targetEndDate',
  })

  useEffect(() => {
    if (!open) {
      reset()
      clearErrors()
    }
  }, [clearErrors, open, reset])

  const onSubmit = async (values: CreateProjectFormValues) => {
    clearErrors('root.serverError')

    if (!workspace?.id) {
      setError('root.serverError', {
        message:
          'Workspace context is unavailable. Please refresh and try again.',
      })

      return
    }

    try {
      await createProjectMutation.mutateAsync(buildCreateProjectRequest(values))

      setOpen(false)
      reset()
    } catch (error) {
      setError('root.serverError', {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create the project.',
      })
    }
  }

  const serverError = errors.root?.serverError

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!createProjectMutation.isPending) {
          setOpen(nextOpen)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost">
            <Plus />
            New Project
          </Button>
        }
      />

      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          'w-full h-1/2',
          'max-w-3xl!',
          'gap-0',
          'overflow-hidden',
          'shadow-2xl',
          'rounded-2xl',
          'p-0'
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
        >
          <div className="p-2">
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
                        'text-2xl! font-semibold!',
                        'focus-visible:ring-0',
                        'max-w-full w-fit! border-none!',
                        'field-sizing-content bg-transparent!'
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
                    icon={<GitBranch className="size-3.5" />}
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
                    icon={<CircleDot className="size-3.5" />}
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
                    icon={<Layers3 className="size-3.5" />}
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

              <MoveRight size={15} />

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

          <Separator className="mt-5" />

          <div className="p-2">
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
                        'bg-transparent! focus-visible:ring-0',
                        'border-none w-full'
                      )}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </>
                )}
              />
            </Field>

            {serverError && (
              <Alert variant="destructive" className="mt-5" role="alert">
                <AlertTitle>Unable to create project</AlertTitle>

                <AlertDescription>{serverError.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>

        <DialogFooter className="my-auto border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={createProjectMutation.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-project-form"
            disabled={!isValid || createProjectMutation.isPending}
            aria-disabled={!isValid || createProjectMutation.isPending}
            aria-busy={createProjectMutation.isPending}
          >
            {createProjectMutation.isPending && (
              <Spinner aria-hidden="true" data-icon="inline-start" />
            )}
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
