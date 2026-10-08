'use client'

import type { ReactNode } from 'react'
import { useId, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, UserRound, Users } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/shared/ui/combobox'
import { Button } from '@/shared/ui/button'
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
import { Separator } from '@/shared/ui/separator'
import { Spinner } from '@/shared/ui/spinner'
import { cn } from '@/shared/lib/utils'

import { buildCreateTeamRequest } from '../lib/create-team.utils'
import {
  CreateTeamSchema,
  type CreateTeamFormValues,
} from '../model/create-team.schema'
import { useCreateTeamMutation } from '../model/use-create-team.mutation'

import { ButtonSize } from '@/shared/ui/button'

interface CreateTeamDialogProps {
  readonly children?: ReactNode
  readonly triggerClassName?: string
  readonly size?: ButtonSize
}

interface TeamMemberOption {
  readonly id: string
  readonly name: string
  readonly email: string
}

const TEAM_MEMBER_OPTIONS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Arun Thomas',
    email: 'arun@orbit.dev',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Rahul Nair',
    email: 'rahul@orbit.dev',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Meera Joseph',
    email: 'meera@orbit.dev',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Nikhil Das',
    email: 'nikhil@orbit.dev',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Aisha Khan',
    email: 'aisha@orbit.dev',
  },
] satisfies readonly TeamMemberOption[]

const getMember = (memberId: string): TeamMemberOption | undefined =>
  TEAM_MEMBER_OPTIONS.find((member) => member.id === memberId)

interface TeamMembersFieldProps {
  readonly id: string
  readonly value: readonly string[]
  readonly invalid: boolean
  readonly onChange: (value: string[]) => void
}

const TeamMembersField = ({
  id,
  value,
  invalid,
  onChange,
}: TeamMembersFieldProps) => {
  const selectedMembers = value
    .map(getMember)
    .filter((member): member is TeamMemberOption => member !== undefined)

  return (
    <Combobox
      multiple
      items={TEAM_MEMBER_OPTIONS}
      value={selectedMembers}
      onValueChange={(nextValue) => {
        onChange(nextValue.map((member) => member.id))
      }}
      itemToStringValue={(member) => `${member.name} ${member.email}`}
    >
      <ComboboxChips
        id={id}
        className={cn(
          'min-h-8 w-fit max-w-full rounded-full px-2',
          'border bg-background shadow-none',
          'focus-within:ring-1 focus-within:ring-ring',
          invalid && 'border-destructive'
        )}
        aria-label="Team members"
        aria-invalid={invalid}
      >
        <Users
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />

        <ComboboxValue>
          {selectedMembers.map((member) => (
            <ComboboxChip key={member.id}>{member.name}</ComboboxChip>
          ))}
        </ComboboxValue>

        <ComboboxChipsInput
          placeholder={
            selectedMembers.length > 0 ? 'Add more...' : 'Add members'
          }
          autoComplete="off"
          aria-label={
            selectedMembers.length > 0
              ? 'Add more team members'
              : 'Add team members'
          }
        />
      </ComboboxChips>

      <ComboboxContent align="start" side="bottom" className="w-80">
        <ComboboxEmpty>No members found.</ComboboxEmpty>

        <ComboboxList className="max-h-60 overflow-y-auto">
          {(member) => (
            <ComboboxItem key={member.id} value={member}>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{member.name}</span>

                <span className="truncate text-xs text-muted-foreground">
                  {member.email}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

interface TeamLeadFieldProps {
  readonly id: string
  readonly value?: string
  readonly invalid: boolean
  readonly onChange: (value: string | undefined) => void
}

const TeamLeadField = ({
  id,
  value,
  invalid,
  onChange,
}: TeamLeadFieldProps) => {
  const selectedMember = value ? getMember(value) : undefined

  return (
    <Combobox
      items={TEAM_MEMBER_OPTIONS}
      value={selectedMember ?? null}
      onValueChange={(nextValue) => {
        onChange(nextValue?.id)
      }}
      itemToStringValue={(member) => `${member.name} ${member.email}`}
    >
      <ComboboxTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-8 rounded-full px-2.5',
              'justify-start gap-1.5',
              'font-normal shadow-none',
              'hover:bg-accent',
              'focus-visible:ring-1',
              invalid && 'border-destructive'
            )}
            aria-label={
              selectedMember
                ? `Team lead: ${selectedMember.name}`
                : 'Team lead: No lead assigned'
            }
            aria-invalid={invalid}
          >
            <UserRound className="size-3.5 shrink-0" aria-hidden="true" />

            <span className="max-w-36 truncate">
              {selectedMember?.name ?? 'No lead'}
            </span>
          </Button>
        }
      />

      <ComboboxContent align="start" side="bottom" className="w-80">
        <div className="p-2">
          <ComboboxInput
            placeholder="Search members..."
            showTrigger={false}
            showClear
            className="h-8"
            autoComplete="off"
            aria-label="Search team lead"
          />
        </div>

        <ComboboxEmpty>No members found.</ComboboxEmpty>

        <ComboboxList className="max-h-56 overflow-y-auto">
          {(member) => (
            <ComboboxItem key={member.id} value={member}>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{member.name}</span>

                <span className="truncate text-xs text-muted-foreground">
                  {member.email}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const CreateTeamDialog = ({
  children,
  triggerClassName,
  size
}: CreateTeamDialogProps) => {
  const createTeamMutation = useCreateTeamMutation()
  const [open, setOpen] = useState(false)

  const titleId = useId()
  const descriptionId = useId()
  const nameId = useId()
  const teamDescriptionId = useId()
  const membersId = useId()
  const leadId = useId()

  const form = useForm<CreateTeamFormValues>({
    resolver: zodResolver(CreateTeamSchema),

    defaultValues: {
      name: '',
      description: '',
      memberIds: [],
      leadId: undefined,
    },

    mode: 'onTouched',
  })

  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isValid },
  } = form

  const handleOpenChange = (nextOpen: boolean) => {
    if (createTeamMutation.isPending) {
      return
    }

    setOpen(nextOpen)

    if (!nextOpen) {
      reset()
      clearErrors()
      createTeamMutation.reset()
    }
  }

  const handleCreateTeam = async (values: CreateTeamFormValues) => {
    clearErrors('root.serverError')

    try {
      await createTeamMutation.mutateAsync(buildCreateTeamRequest(values))

      setOpen(false)
      reset()
    } catch (error) {
      setError('root.serverError', {
        message:
          error instanceof Error ? error.message : 'Failed to create the team.',
      })
    }
  }

  const serverError = errors.root?.serverError

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={size || 'default'}
            className={cn('shrink-0', triggerClassName)}
            aria-label="Create a new team"
          >
            {children ?? (
              <>
                <Plus aria-hidden="true" />
                New Team
              </>
            )}
          </Button>
        }
      />

      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          'w-full max-w-2xl!',
          'gap-0 overflow-hidden',
          'rounded-2xl p-0 shadow-2xl'
        )}
      >
        <DialogHeader>
          <DialogTitle id={titleId} className="sr-only">
            New team
          </DialogTitle>

          <DialogDescription id={descriptionId} className="sr-only">
            Create a new team in the current workspace.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-team-form"
          onSubmit={handleSubmit(handleCreateTeam)}
          noValidate
          aria-label="New team form"
          aria-busy={createTeamMutation.isPending}
        >
          <div className="p-2">
            <FieldGroup>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor={nameId} className="sr-only">
                      Team name
                    </FieldLabel>

                    <Input
                      {...field}
                      id={nameId}
                      autoFocus
                      autoComplete="off"
                      placeholder="Team name"
                      required
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                      className={cn(
                        'field-sizing-content',
                        'w-fit max-w-full!',
                        'border-none! bg-transparent!',
                        'text-2xl! font-semibold!',
                        'focus-visible:ring-0'
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
              aria-label="Team properties"
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <Controller
                name="memberIds"
                control={control}
                render={({ field, fieldState }) => (
                  <TeamMembersField
                    id={membersId}
                    value={field.value}
                    invalid={fieldState.invalid}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="leadId"
                control={control}
                render={({ field, fieldState }) => (
                  <TeamLeadField
                    id={leadId}
                    value={field.value}
                    invalid={fieldState.invalid}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <Separator className="mt-5" />

          <div className="p-2">
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor={teamDescriptionId} className="sr-only">
                    Team description
                  </FieldLabel>

                  <Input
                    {...field}
                    id={teamDescriptionId}
                    autoComplete="off"
                    placeholder="Write a description for this team..."
                    aria-label="Team description"
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      'w-full border-none',
                      'bg-transparent! focus-visible:ring-0'
                    )}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {serverError && (
              <div
                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-sm font-medium text-destructive">
                  Unable to create team
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {serverError.message}
                </p>
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={createTeamMutation.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-team-form"
            disabled={!isValid || createTeamMutation.isPending}
            aria-disabled={!isValid || createTeamMutation.isPending}
            aria-busy={createTeamMutation.isPending}
          >
            {createTeamMutation.isPending && (
              <Spinner aria-hidden="true" data-icon="inline-start" />
            )}
            Create team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
