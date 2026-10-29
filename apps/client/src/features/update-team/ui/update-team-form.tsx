'use client'

import { useEffect, useMemo, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { TeamStatus, type Team } from '@/entities/team/model/team.types'
import { CircleDashed } from 'lucide-react'
import { getInitials } from '@/shared/lib/get-initials'
import { formatDate } from '@/shared/lib/format-date'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
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
    field: 'name' | 'description' | 'status',
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
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-none">
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
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
                      className="h-auto border-0 bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
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
                  className="min-h-32 resize-y"
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
      <aside aria-label="Team properties">
        <Card className="gap-0 rounded-xl py-0 shadow-none">
          <CardHeader className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Properties</h2>
          </CardHeader>
          <CardContent className="space-y-5 px-5 py-5">
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
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                Created by{' '}
                <span className="font-medium text-foreground">
                  {team.createdBy.displayName}
                </span>
              </p>
              <p>
                Created{' '}
                <time dateTime={team.createdAt}>
                  {formatDate(team.createdAt)}
                </time>
              </p>
              <p>
                Updated{' '}
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
