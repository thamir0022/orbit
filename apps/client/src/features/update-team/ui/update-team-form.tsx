'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { TeamStatus, type Team } from '@/entities/team/model/team.types'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import { getWorkspaceMemberSummaries } from '@/entities/workspace/api/workspace-member-summaries.api'
import { CircleDashed } from 'lucide-react'
import { getInitials } from '@/shared/lib/get-initials'
import { formatDate } from '@/shared/lib/format-date'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/shared/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { SearchableSelect } from '@/shared/ui/searchable-select'
import { Spinner } from '@/shared/ui/spinner'
import { Textarea } from '@/shared/ui/textarea'
import { getUpdateTeamDefaultValues } from '../lib/update-team.utils'
import { useUpdateTeamMutation } from '../model/use-update-team.mutation'
import {
  UpdateTeamSchema,
  type UpdateTeamFormValues,
} from '../model/update-team.schema'

export function UpdateTeamForm({ team }: { readonly team: Team }) {
  const updateTeam = useUpdateTeamMutation()
  const workspace = useWorkspace()
  const membersQuery = useQuery({
    queryKey: ['workspace-member-summaries', workspace?.id],
    queryFn: getWorkspaceMemberSummaries,
    enabled: Boolean(workspace?.id),
  })
  const defaultValues = useMemo(() => getUpdateTeamDefaultValues(team), [team])
  const lastSaved = useRef(defaultValues)
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
    lastSaved.current = defaultValues
  }, [defaultValues, reset])

  const saveField = async (
    field: 'name' | 'description' | 'status' | 'leadId',
    value: string
  ) => {
    clearErrors('root.serverError')
    const normalized = value.trim()
    if (normalized === lastSaved.current[field]) return
    try {
      await updateTeam.mutateAsync({ teamKey: team.key, [field]: normalized })
      const values = { ...getValues(), [field]: normalized }
      lastSaved.current = values
      reset(values)
    } catch (cause) {
      setError('root.serverError', {
        message:
          cause instanceof Error
            ? cause.message
            : 'Unable to save team changes.',
      })
    }
  }

  const saveText = async (field: 'name' | 'description', value: string) => {
    if (await trigger(field)) await saveField(field, value)
  }

  return (
    <div className="grid min-h-full min-w-0 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <Card className="min-h-full min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-none">
        <CardHeader className="border-b px-5 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-12 shrink-0">
              <AvatarImage src={team.avatarUrl || undefined} alt="" />
              <AvatarFallback>{getInitials(team.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="w-fit max-w-full gap-1"
                  >
                    <FieldLabel htmlFor="team-name" className="sr-only">
                      Team name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="team-name"
                      aria-invalid={fieldState.invalid}
                      onBlur={(event) => {
                        field.onBlur()
                        void saveText('name', event.currentTarget.value)
                      }}
                      size={Math.max(
                        8,
                        Math.min(field.value?.length ?? 8, 100)
                      )}
                      className="h-auto w-auto max-w-full min-w-0 border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 sm:text-3xl"
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>
            {updateTeam.isPending ? (
              <span
                role="status"
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <Spinner aria-hidden="true" className="size-3" /> Saving…
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-5 py-6 sm:px-6">
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="team-description">
                  About this team
                </FieldLabel>
                <Textarea
                  {...field}
                  id="team-description"
                  aria-invalid={fieldState.invalid}
                  placeholder="What does your team work on?"
                  onBlur={(event) => {
                    field.onBlur()
                    void saveText('description', event.currentTarget.value)
                  }}
                  className="h-40 resize-none"
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
          {errors.root?.serverError ? (
            <Alert variant="destructive" role="alert">
              <AlertTitle>Unable to save changes</AlertTitle>
              <AlertDescription>
                {errors.root.serverError.message}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
      <aside aria-label="Team properties" className="h-full">
        <Card className="h-full gap-0 rounded-xl py-0 shadow-none">
          <CardHeader className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Properties</h2>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-5 px-5 py-5">
            <Controller
              name="leadId"
              control={control}
              render={({ field, fieldState }) => {
                const selected = membersQuery.data?.find(
                  (member) => member.id === field.value
                )
                const name =
                  selected?.displayName ?? team.lead?.displayName ?? 'No Lead'
                const avatarUrl = selected?.avatarUrl ?? team.lead?.avatarUrl
                return (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor="team-lead">Lead</FieldLabel>
                    <Combobox
                      items={membersQuery.data ?? []}
                      value={selected ?? null}
                      onValueChange={(member) => {
                        if (!member) return
                        field.onChange(member.id)
                        void saveField('leadId', member.id)
                      }}
                      itemToStringValue={(member) => member.displayName}
                    >
                      <ComboboxTrigger
                        render={
                          <Button
                            id="team-lead"
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                            aria-label={`Team lead: ${name}`}
                            aria-invalid={fieldState.invalid}
                            disabled={membersQuery.isPending}
                          />
                        }
                      >
                        {name !== 'No Lead' ? (
                          <Avatar className="size-5">
                            <AvatarImage src={avatarUrl ?? undefined} alt="" />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                        ) : null}
                        <span className="min-w-0 flex-1 truncate text-left">
                          {name}
                        </span>
                      </ComboboxTrigger>
                      <ComboboxContent side="left" className="w-64">
                        <ComboboxInput
                          placeholder="Search workspace members"
                          aria-label="Search workspace members"
                          showTrigger={false}
                        />
                        <ComboboxEmpty>
                          No workspace members found.
                        </ComboboxEmpty>
                        <ComboboxList className="max-h-60 overflow-y-auto">
                          {(member) => (
                            <ComboboxItem key={member.id} value={member}>
                              <Avatar className="size-6">
                                <AvatarImage
                                  src={member.avatarUrl ?? undefined}
                                  alt=""
                                />
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(member.displayName)}
                                </AvatarFallback>
                              </Avatar>
                              {member.displayName}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {membersQuery.isError ? (
                      <p role="alert" className="text-xs text-destructive">
                        Unable to load workspace members.
                      </p>
                    ) : null}
                  </Field>
                )
              }}
            />
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <SearchableSelect
                  id="team-status"
                  label="Status"
                  value={field.value ?? team.status}
                  options={Object.values(TeamStatus)}
                  placeholder="Select status"
                  invalid={fieldState.invalid}
                  icon={<CircleDashed aria-hidden="true" className="size-4" />}
                  onChange={(value) => {
                    field.onChange(value)
                    void saveField('status', value)
                  }}
                />
              )}
            />
            <div className="mt-auto space-y-1 text-xs text-muted-foreground">
              <p>
                Created by{' '}
                <span className="font-medium text-foreground">
                  {team.createdBy.displayName}
                </span>{' '}
                on{' '}
                <time dateTime={team.createdAt}>
                  {formatDate(team.createdAt)}
                </time>
              </p>
              <p>
                Last updated on{' '}
                <time dateTime={team.updatedAt}>
                  {formatDate(team.updatedAt)}
                </time>
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
