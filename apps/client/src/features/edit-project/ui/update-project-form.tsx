'use client'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CalendarDays,
  CircleDashed,
  CircleGauge,
  EllipsisVertical,
  MoveRight,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  Target,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import type { Project } from '@/entities/project/model/project.types'
import {
  ProjectPriority,
  ProjectStage,
  ProjectStatus,
  ProjectType,
} from '@/entities/project/model/project.types'

import { formatDate } from '@/shared/lib/format-date'
import { getInitials } from '@/shared/lib/get-initials'
import { cn } from '@/shared/lib/utils'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/card'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { SearchableSelect } from '@/shared/ui/searchable-select'
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
  formatDateLabel,
  formatDateValue,
  getProjectOverviewPath,
  getProjectUserStoriesPath,
  getUpdateProjectDefaultValues,
  parseDateValue,
} from '../lib/update-project.utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { DeleteProjectButton } from '@/features/delete-project'

interface UpdateProjectFormProps {
  readonly project: Project
}

const PROJECT_TYPE_OPTIONS = Object.values(ProjectType)

const PROJECT_STAGE_OPTIONS = Object.values(ProjectStage)

const PROJECT_PRIORITY_OPTIONS = Object.values(ProjectPriority)

const PROJECT_STATUS_OPTIONS = Object.values(ProjectStatus)

interface ProjectDateFieldProps {
  readonly id: string
  readonly label: string
  readonly value?: string
  readonly invalid: boolean
  readonly minDate?: string
  readonly maxDate?: string
  readonly onChange: (value: string) => void
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
          className={cn(
            'h-8 rounded-full px-2.5',
            'justify-start gap-1.5',
            'font-normal',
            'shadow-none',
            'hover:bg-accent',
            'focus-visible:ring-1',
            invalid && 'border-destructive'
          )}
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
      variant="outline"
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
  const leadId = useId()
  const propertiesPanelId = useId()
  const propertiesToggleRef = useRef<HTMLButtonElement | null>(null)
  const defaultValues = useMemo(
    () => getUpdateProjectDefaultValues(project),
    [project]
  )
  const lastSavedValuesRef = useRef<UpdateProjectFormValues>(defaultValues)
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true)
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
    setValue,
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
    setValue(field, value, {
      shouldDirty: true,
      shouldValidate: true,
    })
    const isValid = await trigger(field)
    if (!isValid) {
      return
    }
    await saveField(field, value)
  }
  const serverError = errors.root?.serverError
  const startDate = useWatch({
    control,
    name: 'startDate',
  })
  const targetEndDate = useWatch({
    control,
    name: 'targetEndDate',
  })
  const startDateId = useId()
  const targetEndDateId = useId()
  return (
    <div className="mx-auto w-full max-w-7xl md:p-6">
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
        className={cn(
          'grid min-w-0 items-start',
          'grid-cols-1 gap-4',
          'lg:transition-[grid-template-columns,gap]',
          'lg:duration-300 lg:ease-out',
          'motion-reduce:transition-none',
          isPropertiesOpen
            ? 'lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-4'
            : 'lg:grid-cols-[minmax(0,1fr)_0rem] lg:gap-0'
        )}
      >
        {/* Main content */}
        <section aria-label="Project overview" className="min-w-0">
          <Card className="min-h-154 w-full overflow-hidden rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex min-w-0 items-center gap-4">
                <Avatar className="size-16 shrink-0">
                  <AvatarImage
                    src={project.avatarUrl || undefined}
                    alt={project.name}
                  />
                  <AvatarFallback className="text-lg font-medium">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Project actions"
                    >
                      <EllipsisVertical aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <DeleteProjectButton
                        projectKey={project.key}
                        projectName={project.name}
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <SearchableSelect
                      id="project-type"
                      label="Type"
                      value={field.value ?? project.type}
                      options={PROJECT_TYPE_OPTIONS}
                      placeholder="Select type"
                      invalid={fieldState.invalid}
                      side="bottom"
                      icon={
                        <Settings2 className="size-3.5" aria-hidden="true" />
                      }
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
                    <SearchableSelect
                      id="project-status"
                      label="Status"
                      value={field.value ?? project.status}
                      options={PROJECT_STATUS_OPTIONS}
                      side="bottom"
                      placeholder="Select status"
                      invalid={fieldState.invalid}
                      icon={
                        <CircleDashed className="size-3.5" aria-hidden="true" />
                      }
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
                    <SearchableSelect
                      id="project-stage"
                      label="Stage"
                      value={field.value ?? project.stage}
                      options={PROJECT_STAGE_OPTIONS}
                      side="bottom"
                      placeholder="Select stage"
                      invalid={fieldState.invalid}
                      icon={<Target className="size-3.5" aria-hidden="true" />}
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
                    <SearchableSelect
                      id="project-priority"
                      label="Priority"
                      value={field.value ?? project.priority}
                      options={PROJECT_PRIORITY_OPTIONS}
                      side="bottom"
                      placeholder="Select priority"
                      invalid={fieldState.invalid}
                      icon={
                        <CircleGauge className="size-3.5" aria-hidden="true" />
                      }
                      onChange={(value) => {
                        field.onChange(value)
                        void handlePropertyChange('priority', value)
                      }}
                    />
                  )}
                />
                <ProjectLeadField id={leadId} />
                <div className="flex gap-2 items-center">
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
                        onChange={(value) => {
                          void handleDateChange('startDate', value)
                        }}
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
                        onChange={(value) => {
                          void handleDateChange('targetEndDate', value)
                        }}
                      />
                    )}
                  />
                </div>
              </div>
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
                      className="min-h-24 max-h-52"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </CardContent>

            <CardFooter className="mt-auto border-t">
              <div className="flex w-full items-center justify-between gap-6 text-xs">
                {/* Created */}
                <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">
                  <span>Created by</span>
                  <div className="flex items-center gap-1">
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
                    {formatDate(project.createdAt)}
                  </time>
                </div>
                {/* Last updated */}
                <div className="shrink-0 text-right">
                  <span>Last updated at </span>
                  <time dateTime={project.updatedAt} className="font-medium">
                    {formatDate(project.updatedAt)}
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
          className={cn(
            'h-full min-w-0 overflow-hidden',
            'transition-[opacity,transform]',
            'duration-300 ease-out',
            'motion-reduce:transition-none',
            isPropertiesOpen
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none -translate-x-2 opacity-0'
          )}
        >
          <Card className="flex h-full max-h-[calc(100dvh-7rem)] min-h-0 flex-col overflow-hidden rounded-2xl shadow-sm lg:sticky lg:top-4">
            <CardHeader className="flex shrink-0 flex-row items-center justify-between gap-3 p-4 pb-3">
              <h2 className="text-sm font-semibold">Properties</h2>
            </CardHeader>
            <ScrollArea className="min-h-0 flex-1">
              <CardContent className="space-y-5 p-4 pt-1">
                <div className="flex flex-none flex-col items-start gap-5">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SearchableSelect
                        id="project-type"
                        label="Type"
                        value={field.value ?? project.type}
                        options={PROJECT_TYPE_OPTIONS}
                        placeholder="Select type"
                        invalid={fieldState.invalid}
                        side="left"
                        icon={
                          <Settings2 className="size-3.5" aria-hidden="true" />
                        }
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
                      <SearchableSelect
                        id="project-status"
                        label="Status"
                        value={field.value ?? project.status}
                        options={PROJECT_STATUS_OPTIONS}
                        placeholder="Select status"
                        invalid={fieldState.invalid}
                        side="left"
                        icon={
                          <CircleDashed
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        }
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
                      <SearchableSelect
                        id="project-stage"
                        label="Stage"
                        value={field.value ?? project.stage}
                        options={PROJECT_STAGE_OPTIONS}
                        placeholder="Select stage"
                        invalid={fieldState.invalid}
                        side="left"
                        icon={
                          <Target className="size-3.5" aria-hidden="true" />
                        }
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
                      <SearchableSelect
                        id="project-priority"
                        label="Priority"
                        value={field.value ?? project.priority}
                        options={PROJECT_PRIORITY_OPTIONS}
                        placeholder="Select priority"
                        invalid={fieldState.invalid}
                        side="left"
                        icon={
                          <CircleGauge
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        }
                        onChange={(value) => {
                          field.onChange(value)
                          void handlePropertyChange('priority', value)
                        }}
                      />
                    )}
                  />
                  <ProjectLeadField id={leadId} />
                </div>
                <Separator />
                <div className="flex items-center gap-2">
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
                        onChange={(value) => {
                          void handleDateChange('startDate', value)
                        }}
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
                        onChange={(value) => {
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
