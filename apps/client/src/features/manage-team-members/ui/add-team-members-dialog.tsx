'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import {
  getWorkspaceMemberSummaries,
  type WorkspaceMemberSummary,
} from '@/entities/workspace/api/workspace-member-summaries.api'
import type { TeamMember } from '@/entities/team/api/get-team-members.api'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/shared/ui/combobox'
import { useTeamMemberMutations } from '../model/use-team-member-mutations'

/** Selects multiple workspace members and adds them in one request. */
export function AddTeamMembersDialog({
  teamKey,
  members,
}: {
  readonly teamKey: string
  readonly members: readonly TeamMember[]
}) {
  const workspace = useWorkspace()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<WorkspaceMemberSummary[]>([])
  const { add } = useTeamMemberMutations(teamKey)
  const query = useQuery({
    queryKey: ['workspace-member-summaries', workspace?.id],
    queryFn: getWorkspaceMemberSummaries,
    enabled: open && Boolean(workspace?.id),
  })
  const options = useMemo(() => {
    const current = new Set(
      members
        .filter((member) => member.status === 'active')
        .map((member) => member.id)
    )
    return (query.data ?? []).filter((member) => !current.has(member.id))
  }, [members, query.data])

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!add.isPending) {
          setOpen(value)
          setSelected([])
          add.reset()
        }
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="ghost" />}>
        <Plus aria-hidden="true" className="size-4" />
        Add members
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add team members</DialogTitle>
          <DialogDescription>
            Choose people from your workspace to join this team.
          </DialogDescription>
        </DialogHeader>
        {query.isPending ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading workspace members…
          </p>
        ) : query.isError ? (
          <div role="alert" className="space-y-2 text-sm">
            <p>Unable to load workspace members.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <Combobox
            multiple
            items={options}
            value={selected}
            disabled={add.isPending}
            onValueChange={setSelected}
            itemToStringValue={(member) =>
              `${member.displayName} ${member.firstName} ${member.lastName}`
            }
          >
            <ComboboxChips className="w-full">
              <ComboboxValue>
                {selected.map((member) => (
                  <ComboboxChip key={member.id}>
                    {member.displayName}
                  </ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput
                aria-label="Search workspace members"
                placeholder="Search members…"
              />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>No available members found.</ComboboxEmpty>
              <ComboboxList>
                {(member) => (
                  <ComboboxItem key={member.id} value={member}>
                    {member.displayName}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        )}
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {selected.length} selected · Add up to 100 at a time
        </p>
        {add.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {add.error.message}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={add.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={
              !selected.length ||
              selected.length > 100 ||
              add.isPending ||
              query.isError
            }
            onClick={() =>
              add.mutate(
                selected.map((member) => member.id),
                {
                  onSuccess: () => {
                    setOpen(false)
                    setSelected([])
                  },
                }
              )
            }
          >
            {add.isPending ? 'Adding…' : 'Add members'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
