'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, PanelRightClose, PanelRightOpen } from 'lucide-react'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'

import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import type { Team, TeamStatus } from '@/entities/team/model/team.types'
import {
  formatTeamDate,
  formatTeamStatus,
  getTeamInitials,
} from '@/entities/team/lib/team.utils'

import { useUpdateTeamMutation } from '../model/use-update-team.mutation'
import {
  UpdateTeamSchema,
  type UpdateTeamFormValues,
} from '../model/update-team.schema'
import { getUpdateTeamDefaultValues } from '../lib/update-team.utils'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/card'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Spinner } from '@/shared/ui/spinner'
import { Textarea } from '@/shared/ui/textarea'
import { usePathname } from 'next/navigation'

interface UpdateTeamFormProps {
  readonly team: Team
}

export function UpdateTeamForm({ team }: UpdateTeamFormProps) {
  const workspace = useWorkspace()
  const updateTeam = useUpdateTeamMutation()

  const propertiesPanelId = useId()
  const propertiesToggleRef = useRef<HTMLButtonElement | null>(null)

  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true)

  const defaultValues = useMemo(() => getUpdateTeamDefaultValues(team), [team])

  const lastSavedValuesRef = useRef<UpdateTeamFormValues>(defaultValues)

  const form = useForm<UpdateTeamFormValues>({
    resolver: zodResolver(UpdateTeamSchema),
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
    ? `/${workspace.slug}/teams/${team.id}`
    : '#'

  const membersPath = workspace?.slug
    ? `/${workspace.slug}/teams/${team.id}/members`
    : '#'

  const handlePropertiesToggle = () => {
    setIsPropertiesOpen((current) => !current)

    requestAnimationFrame(() => {
      propertiesToggleRef.current?.focus()
    })
  }

  const saveField = async (
    field: keyof UpdateTeamFormValues,
    value: UpdateTeamFormValues[keyof UpdateTeamFormValues]
  ) => {
    clearErrors('root.serverError')

    try {
      await updateTeam.mutateAsync({
        teamId: team.id,
        ...(field === 'name' && {
          name: String(value).trim(),
        }),
        ...(field === 'description' && {
          description: String(value).trim(),
        }),
        ...(field === 'status' && {
          status: value as TeamStatus,
        }),
        ...(field === 'leadId' && {
          leadId: value,
        }),
      })

      const currentValues = getValues()

      const normalizedValue =
        field === 'name' || field === 'description'
          ? String(value).trim()
          : value

      const nextValues = {
        ...currentValues,
        [field]: normalizedValue,
      } as UpdateTeamFormValues

      lastSavedValuesRef.current = nextValues

      reset(nextValues)
    } catch (error) {
      setError('root.serverError', {
        message:
          error instanceof Error ? error.message : 'Failed to update the team.',
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
    const lastSavedValue = lastSavedValuesRef.current[field]?.trim()

    if (normalizedValue === lastSavedValue) {
      return
    }

    await saveField(field, normalizedValue)
  }

  const serverError = errors.root?.serverError

  const pathname = usePathname()

  const isOverviewActive = pathname === overviewPath

  const isMembersActive =
    pathname === membersPath || pathname.startsWith(`${membersPath}/`)

  return (
    <div className="mx-auto size-full max-w-7xl md:p-6">
      <div className="mb-4">
        <Link href={workspace?.slug ? `/${workspace.slug}/teams` : '#'}>
          <Button type="button" variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Teams</span>
          </Button>
        </Link>

        <nav
          aria-label="Team navigation"
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

          <Link href={membersPath}>
            <Button
              type="button"
              variant={isMembersActive ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-full px-3"
              aria-current={isMembersActive ? 'page' : undefined}
            >
              Members
            </Button>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {updateTeam.isPending && (
              <span
                className="flex items-center gap-1.5 text-xs"
                aria-live="polite"
              >
                <Spinner className="size-3" aria-hidden="true" />
                Saving…
              </span>
            )}

            <Button
              ref={propertiesToggleRef}
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={
                isPropertiesOpen
                  ? 'Hide team properties'
                  : 'Show team properties'
              }
              aria-expanded={isPropertiesOpen}
              aria-controls={propertiesPanelId}
              onClick={handlePropertiesToggle}
              className="shrink-0"
            >
              {isPropertiesOpen ? (
                <PanelRightClose aria-hidden="true" />
              ) : (
                <PanelRightOpen aria-hidden="true" />
              )}
            </Button>
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
        <section aria-label="Team overview" className="min-w-0">
          <Card className="min-h-154 w-full overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="p-7 pb-5 md:p-8 md:pb-6">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar className="size-16 shrink-0 rounded-xl">
                  <AvatarImage
                    src={team.avatarUrl || undefined}
                    alt={team.name}
                  />

                  <AvatarFallback className="rounded-xl text-lg font-medium">
                    {getTeamInitials(team.name)}
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
                        <FieldLabel className="sr-only">Team name</FieldLabel>

                        <Input
                          {...field}
                          id="team-name"
                          aria-invalid={fieldState.invalid}
                          aria-describedby={
                            fieldState.invalid ? 'team-name-error' : undefined
                          }
                          onBlur={(event) => {
                            field.onBlur()

                            void handleTextBlur(
                              'name',
                              event.currentTarget.value
                            )
                          }}
                          className="w-fit! max-w-full border-none! bg-transparent! text-2xl! font-semibold! focus-visible:ring-0 field-sizing-content"
                        />

                        {fieldState.invalid && (
                          <FieldError
                            id="team-name-error"
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
                      Team description
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="team-description"
                      aria-label="Team description"
                      aria-invalid={fieldState.invalid}
                      placeholder={`Ideas or thoughts about ${team.name}`}
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
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Created by</span>

                  <div className="flex items-center gap-1.5">
                    <Avatar className="size-5 shrink-0">
                      <AvatarImage
                        src={team.createdBy.avatarUrl ?? undefined}
                        alt=""
                      />

                      <AvatarFallback className="text-[9px]">
                        {getTeamInitials(team.createdBy.displayName)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="font-medium">
                      {team.createdBy.displayName}
                    </span>
                  </div>

                  <span>at</span>

                  <time dateTime={team.createdAt}>
                    {formatTeamDate(team.createdAt)}
                  </time>
                </div>

                <div className="shrink-0 text-right">
                  <span>Last updated at </span>

                  <time dateTime={team.updatedAt} className="font-medium">
                    {formatTeamDate(team.updatedAt)}
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

        <aside
          id={propertiesPanelId}
          aria-label="Team properties"
          aria-hidden={!isPropertiesOpen}
          inert={!isPropertiesOpen}
          className={[
            'h-full min-w-0 overflow-hidden',
            'transition-[opacity,transform]',
            'duration-300 ease-out',
            'motion-reduce:transition-none',
            isPropertiesOpen
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none -translate-x-2 opacity-0',
          ].join(' ')}
        >
          <Card className="flex h-full max-h-[calc(100dvh-7rem)] min-h-0 flex-col overflow-hidden rounded-2xl shadow-sm lg:sticky lg:top-4">
            <CardHeader className="flex shrink-0 flex-row items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Properties</h2>
            </CardHeader>

            <ScrollArea className="min-h-0 flex-1">
              <CardContent className="space-y-5 p-4 pt-1">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Status</span>

                  <div className="text-sm font-medium">
                    {formatTeamStatus(team.status)}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Lead</span>

                  {team.lead ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarImage
                          src={team.lead.avatarUrl ?? undefined}
                          alt=""
                        />

                        <AvatarFallback className="text-[10px]">
                          {getTeamInitials(team.lead.displayName)}
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm font-medium">
                        {team.lead.displayName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No lead assigned
                    </span>
                  )}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </aside>
      </div>
    </div>
  )
}
