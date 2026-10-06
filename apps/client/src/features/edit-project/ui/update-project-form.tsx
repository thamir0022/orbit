'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Controller,
  useForm,
  type FieldError as ReactHookFormFieldError,
} from 'react-hook-form'

import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import type { Project } from '@/entities/project/model/project.types'
import {
  ProjectPriority,
  ProjectStage,
  ProjectStatus,
  ProjectType,
} from '@/entities/project/model/project.types'
import {
  formatEnumLabel,
  formatProjectDate,
  getInitials,
} from '@/entities/project/lib/project.utils'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/card'
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
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Spinner } from '@/shared/ui/spinner'
import { Textarea } from '@/shared/ui/textarea'

import { useUpdateProjectMutation } from '../model/use-update-project.mutation'
import {
  UpdateProjectSchema,
  type UpdateProjectFormValues,
} from '../model/update-project.schema'
import {
  buildFieldUpdateInput,
  formatDatePart,
  getUpdateProjectDefaultValues,
  getProjectOverviewPath,
  getProjectUserStoriesPath,
  parseDateValue,
  toDateTimeLocalValue,
} from '../lib/update-project.utils'

interface UpdateProjectFormProps {
  readonly project: Project
}

interface ProjectComboboxFieldProps<T extends string> {
  readonly id: string
  readonly label: string
  readonly value: T
  readonly options: readonly T[]
  readonly placeholder: string
  readonly invalid: boolean
  readonly onChange: (value: T) => void
}

interface ProjectDatePickerFieldProps {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly invalid: boolean
  readonly error?: ReactHookFormFieldError
  readonly onChange: (value: string) => void
}

const PROJECT_TYPE_OPTIONS = Object.values(ProjectType)

const PROJECT_STAGE_OPTIONS = Object.values(ProjectStage)

const PROJECT_PRIORITY_OPTIONS = Object.values(ProjectPriority)

const PROJECT_STATUS_OPTIONS = Object.values(ProjectStatus)

const ProjectComboboxField = <T extends string>({
  id,
  label,
  value,
  options,
  placeholder,
  invalid,
  onChange,
}: ProjectComboboxFieldProps<T>) => {
  const displayValue = value ? formatEnumLabel(value) : placeholder

  return (
    <Field data-invalid={invalid} className="gap-1">
      <FieldLabel htmlFor={id} className="text-xs">
        {label}
      </FieldLabel>

      <Combobox
        items={options}
        value={value || null}
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
              variant="ghost"
              className={[
                'h-8 w-full justify-between px-2',
                'font-normal text-sm',
                'hover:bg-accent',
                'focus-visible:ring-1',
                invalid ? 'border-destructive' : '',
              ].join(' ')}
              aria-invalid={invalid}
            />
          }
        >
          <ComboboxValue placeholder={placeholder}>
            {displayValue}
          </ComboboxValue>
        </ComboboxTrigger>

        <ComboboxContent align="start" side="left">
          <div className="p-2">
            <ComboboxInput
              placeholder={`Search ${label.toLowerCase()}`}
              showTrigger={false}
              showClear
              className="h-8"
              autoComplete="off"
            />
          </div>

          <ComboboxEmpty>No {label.toLowerCase()} found.</ComboboxEmpty>

          <ScrollArea className="h-52">
            <ComboboxList className="h-full overflow-y-auto">
              {(option) => (
                <ComboboxItem key={option} value={option}>
                  {formatEnumLabel(option)}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ScrollArea>
        </ComboboxContent>
      </Combobox>

      {invalid && <FieldError />}
    </Field>
  )
}

const ProjectDatePickerField = ({
  id,
  label,
  value,
  invalid,
  error,
  onChange,
}: ProjectDatePickerFieldProps) => {
  const [open, setOpen] = useState(false)

  const selectedDate = useMemo(() => parseDateValue(value), [value])

  const displayValue = selectedDate
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
      }).format(selectedDate)
    : ''

  return (
    <Field data-invalid={invalid} className="gap-1">
      <FieldLabel htmlFor={id} className="text-xs">
        {label}
      </FieldLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="ghost"
            className={[
              'h-8 w-full justify-start gap-2 px-2',
              'font-normal text-sm',
              'hover:bg-accent',
              invalid ? 'border-destructive' : '',
            ].join(' ')}
            aria-invalid={invalid}
          >
            <CalendarDays
              className="size-3.5 shrink-0 opacity-60"
              aria-hidden="true"
            />

            <span className={displayValue ? '' : 'opacity-50'}>
              {displayValue || 'Set date'}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent side="left" align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(nextDate) => {
              onChange(nextDate ? toDateTimeLocalValue(nextDate) : '')

              if (nextDate) {
                setOpen(false)
              }
            }}
            className="rounded-lg border-0"
          />
        </PopoverContent>
      </Popover>

      {invalid && error && <FieldError errors={[error]} />}
    </Field>
  )
}

const PropertiesToggle = ({
  open,
  panelId,
  onToggle,
  buttonRef,
}: {
  readonly open: boolean
  readonly panelId: string
  readonly onToggle: () => void
  readonly buttonRef: React.RefObject<HTMLButtonElement | null>
}) => {
  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={open ? 'Hide project properties' : 'Show project properties'}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
      className="shrink-0"
    >
      {open ? (
        <PanelRightClose aria-hidden="true" />
      ) : (
        <PanelRightOpen aria-hidden="true" />
      )}
    </Button>
  )
}

export const UpdateProjectForm = ({ project }: UpdateProjectFormProps) => {
  const workspace = useWorkspace()
  const updateProject = useUpdateProjectMutation()
  const pathname = usePathname()

  const propertiesPanelId = useId()
  const propertiesToggleRef = useRef<HTMLButtonElement | null>(null)

  const lastSavedValuesRef = useRef<UpdateProjectFormValues>(
    getUpdateProjectDefaultValues(project)
  )

  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true)

  const defaultValues = useMemo(
    () => getUpdateProjectDefaultValues(project),
    [project]
  )

  const form = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(UpdateProjectSchema),
    defaultValues,
    mode: 'onChange',
  })

  const {
    control,
    reset,
    getValues,
    setError,
    clearErrors,
    trigger,
    formState: { errors },
  } = form

  useEffect(() => {
    reset(defaultValues)
    lastSavedValuesRef.current = defaultValues
  }, [defaultValues, reset])

  const overviewPath = workspace?.slug
    ? getProjectOverviewPath(workspace.slug, project.key)
    : '#'

  const userStoriesPath = workspace?.slug
    ? getProjectUserStoriesPath(workspace.slug, project.key)
    : '#'

  const isOverviewActive =
    pathname === overviewPath || pathname.endsWith('/overview')

  const isUserStoriesActive =
    pathname === userStoriesPath || pathname.endsWith('/user-stories')

  const handlePropertiesToggle = () => {
    setIsPropertiesOpen((current) => !current)

    requestAnimationFrame(() => {
      propertiesToggleRef.current?.focus()
    })
  }

  const saveField = async (
    field: keyof UpdateProjectFormValues,
    value: UpdateProjectFormValues[keyof UpdateProjectFormValues]
  ) => {
    clearErrors('root.serverError')

    if (!workspace?.id) {
      setError('root.serverError', {
        message:
          'Workspace context is unavailable. Please refresh and try again.',
      })

      return
    }

    const input = buildFieldUpdateInput(field, value, workspace.id, project.key)

    try {
      await updateProject.mutateAsync(input)

      const currentValues = getValues()

      const normalizedValue =
        field === 'name' || field === 'description'
          ? String(value).trim()
          : value

      const nextValues = {
        ...currentValues,
        [field]: normalizedValue,
      } as UpdateProjectFormValues

      lastSavedValuesRef.current = nextValues

      reset(nextValues)
    } catch (error) {
      setError('root.serverError', {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update the project.',
      })
    }
  }

  const handleTextBlur = async (
    field: 'name' | 'description',
    value: string
  ) => {
    const isValid = await trigger(field)

    if (!isValid) {
      return
    }

    const normalizedValue = value.trim()
    const lastSavedValue = lastSavedValuesRef.current[field].trim()

    if (normalizedValue === lastSavedValue) {
      return
    }

    await saveField(field, normalizedValue)
  }

  const handlePropertyChange = async (
    field: 'type' | 'stage' | 'priority' | 'status' | 'leadId',
    value:
      | ProjectType
      | ProjectStage
      | ProjectPriority
      | ProjectStatus
      | string
      | null
  ) => {
    const isValid = await trigger(field)

    if (!isValid) {
      return
    }

    await saveField(field, value)
  }

  const handleDateChange = async (
    field: 'startDate' | 'targetEndDate',
    value: string
  ) => {
    const isValid = await trigger(field)

    if (!isValid) {
      return
    }

    await saveField(field, value)
  }

  const serverError = errors.root?.serverError

  return (
    <div className="mx-auto w-full max-w-7xl md:px-6">
      {/* Project navigation */}
      <div className="mb-4">
        <div>
          <Link href={workspace?.slug ? `/${workspace.slug}/projects` : '#'}>
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="size-3.5" aria-hidden="true" />

              <span>Projects</span>
            </Button>
          </Link>
        </div>

        {/* Project sections */}
        <nav
          aria-label="Project navigation"
          className="mt-3 flex items-center gap-1"
        >
          <Link href={overviewPath}>
            <Button
              type="button"
              variant={isOverviewActive ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-full px-3"
              aria-current={isOverviewActive ? 'page' : undefined}
            >
              Overview
            </Button>
          </Link>

          <Link href={userStoriesPath}>
            <Button
              type="button"
              variant={isUserStoriesActive ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-full px-3"
              aria-current={isUserStoriesActive ? 'page' : undefined}
            >
              User Stories
            </Button>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {updateProject.isPending && (
              <span
                className="flex items-center gap-1.5 text-xs"
                aria-live="polite"
              >
                <Spinner className="size-3" aria-hidden="true" />
                Saving…
              </span>
            )}

            {/* Page toolbar */}

            <PropertiesToggle
              open={isPropertiesOpen}
              panelId={propertiesPanelId}
              onToggle={handlePropertiesToggle}
              buttonRef={propertiesToggleRef}
            />
          </div>
        </nav>
      </div>

      <div
        className={[
          'grid min-w-0 items-start',
          'grid-cols-1 gap-4',
          'lg:transition-[grid-template-columns,gap]',
          'lg:duration-300 lg:ease-out',
          'motion-reduce:transition-none',
          isPropertiesOpen
            ? 'lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-4'
            : 'lg:grid-cols-[minmax(0,1fr)_0rem] lg:gap-0',
        ].join(' ')}
      >
        {/* Main content */}
        <section aria-label="Project overview" className="min-w-0">
          <Card className="min-h-154 w-full overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="p-7 pb-5 md:p-8 md:pb-6">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar className="size-16 shrink-0 rounded-xl">
                  <AvatarImage
                    src={project.avatarUrl || undefined}
                    alt={project.name}
                  />

                  <AvatarFallback className="rounded-xl text-lg font-medium">
                    {getInitials(project.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel className="sr-only">
                          Project name
                        </FieldLabel>

                        <Input
                          {...field}
                          id="project-name"
                          aria-invalid={fieldState.invalid}
                          aria-describedby={
                            fieldState.invalid
                              ? 'project-name-error'
                              : undefined
                          }
                          onBlur={(event) => {
                            field.onBlur()

                            void handleTextBlur(
                              'name',
                              event.currentTarget.value
                            )
                          }}
                          className="text-2xl! font-semibold! focus-visible:ring-0 max-w-full w-fit! field-sizing-content border-none! bg-transparent!"
                        />

                        {fieldState.invalid && (
                          <FieldError
                            id="project-name-error"
                            errors={[fieldState.error]}
                          />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-7 pb-8 md:px-8">
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel className="sr-only">
                      Project description
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="project-description"
                      aria-label="Project description"
                      aria-invalid={fieldState.invalid}
                      placeholder={`Ideas or thoughts about ${project.name}`}
                      onBlur={(event) => {
                        field.onBlur()

                        void handleTextBlur(
                          'description',
                          event.currentTarget.value
                        )
                      }}
                      className="min-h-24 max-h-52 bg-transparent!"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </CardContent>

            <CardFooter className="mt-auto border-t p-7 pt-6 md:px-8 md:pt-6">
              <div className="flex w-full items-center justify-between gap-6 text-xs">
                {/* Created */}
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Created by</span>

                  <div className="flex items-center gap-1.5">
                    <Avatar className="size-5 shrink-0">
                      <AvatarImage
                        src={project.createdBy.avatarUrl ?? undefined}
                        alt=""
                      />

                      <AvatarFallback className="text-[9px]">
                        {getInitials(project.createdBy.displayName)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="font-medium">
                      {project.createdBy.displayName}
                    </span>
                  </div>

                  <span>at</span>

                  <time dateTime={project.createdAt}>
                    {formatProjectDate(project.createdAt, {
                      dateStyle: 'medium',
                    })}
                  </time>
                </div>

                {/* Last updated */}
                <div className="shrink-0 text-right">
                  <span>Last updated at </span>

                  <time dateTime={project.updatedAt} className="font-medium">
                    {formatProjectDate(project.updatedAt, {
                      dateStyle: 'medium',
                    })}
                  </time>
                </div>
              </div>

              {serverError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Unable to save changes</AlertTitle>

                  <AlertDescription>{serverError.message}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </section>

        {/* Properties sidebar */}
        <aside
          id={propertiesPanelId}
          aria-label="Project properties"
          aria-hidden={!isPropertiesOpen}
          inert={!isPropertiesOpen}
          className={[
            'min-w-0 overflow-hidden',
            'transition-[opacity,transform]',
            'duration-300 ease-out',
            'motion-reduce:transition-none',
            isPropertiesOpen
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none -translate-x-2 opacity-0',
          ].join(' ')}
        >
          <Card className="flex h-full max-h-[calc(100dvh-7rem)] min-h-0 flex-col overflow-hidden rounded-2xl shadow-sm lg:sticky lg:top-4">
            <CardHeader className="flex shrink-0 flex-row items-center justify-between gap-3 p-4 pb-3">
              <h2 className="text-sm font-semibold">Properties</h2>
            </CardHeader>

            <ScrollArea className="min-h-0 flex-1">
              <CardContent className="space-y-5 p-4 pt-1">
                <div className="space-y-3.5">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ProjectComboboxField
                        id="project-type"
                        label="Type"
                        value={field.value}
                        options={PROJECT_TYPE_OPTIONS}
                        placeholder="Select type"
                        invalid={fieldState.invalid}
                        onChange={(value) => {
                          field.onChange(value)

                          void handlePropertyChange('type', value)
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="status"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ProjectComboboxField
                        id="project-status"
                        label="Status"
                        value={field.value}
                        options={PROJECT_STATUS_OPTIONS}
                        placeholder="Select status"
                        invalid={fieldState.invalid}
                        onChange={(value) => {
                          field.onChange(value)

                          void handlePropertyChange('status', value)
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="stage"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ProjectComboboxField
                        id="project-stage"
                        label="Stage"
                        value={field.value}
                        options={PROJECT_STAGE_OPTIONS}
                        placeholder="Select stage"
                        invalid={fieldState.invalid}
                        onChange={(value) => {
                          field.onChange(value)

                          void handlePropertyChange('stage', value)
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="priority"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ProjectComboboxField
                        id="project-priority"
                        label="Priority"
                        value={field.value}
                        options={PROJECT_PRIORITY_OPTIONS}
                        placeholder="Select priority"
                        invalid={fieldState.invalid}
                        onChange={(value) => {
                          field.onChange(value)

                          void handlePropertyChange('priority', value)
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="leadId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel htmlFor="project-lead" className="text-xs">
                          Lead
                        </FieldLabel>

                        <Combobox
                          items={[]}
                          value={null}
                          onValueChange={() => undefined}
                        >
                          <ComboboxTrigger
                            render={
                              <Button
                                id="project-lead"
                                type="button"
                                variant="ghost"
                                disabled
                                className="h-8 w-full justify-between px-2 font-normal text-sm"
                              />
                            }
                          >
                            <ComboboxValue placeholder="No lead assigned">
                              {project.lead?.displayName ?? 'No lead assigned'}
                            </ComboboxValue>

                            <ChevronDown
                              className="size-3.5 shrink-0 opacity-30"
                              aria-hidden="true"
                            />
                          </ComboboxTrigger>

                          <ComboboxContent>
                            <ComboboxEmpty>
                              No workspace members available.
                            </ComboboxEmpty>
                          </ComboboxContent>
                        </Combobox>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-3.5">
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ProjectDatePickerField
                        id="project-start-date"
                        label="Start date"
                        value={field.value}
                        invalid={fieldState.invalid}
                        error={fieldState.error}
                        onChange={(value) => {
                          field.onChange(value)

                          void handleDateChange('startDate', value)
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="targetEndDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ProjectDatePickerField
                        id="project-target-end-date"
                        label="Target date"
                        value={field.value}
                        invalid={fieldState.invalid}
                        error={fieldState.error}
                        onChange={(value) => {
                          field.onChange(value)

                          void handleDateChange('targetEndDate', value)
                        }}
                      />
                    )}
                  />
                </div>
              </CardContent>

              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </Card>
        </aside>
      </div>
    </div>
  )
}
