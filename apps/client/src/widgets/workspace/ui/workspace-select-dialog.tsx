'use client'

import * as React from 'react'
import { AlertCircle, X } from 'lucide-react'

import { WorkspaceCard, type WorkspaceListItem } from '@/entities/workspace'

import { Alert, AlertDescription } from '@/shared/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'

interface WorkspaceSelectionDialogProps {
  open: boolean
  workspaces: WorkspaceListItem[]
  onSelect: (workspace: WorkspaceListItem) => void
  onOpenChange: (open: boolean) => void
  isPending?: boolean
}

export function WorkspaceSelectionDialog({
  open,
  workspaces,
  onOpenChange,
  isPending = false,
}: WorkspaceSelectionDialogProps) {
  const [showCloseWarning, setShowCloseWarning] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setShowCloseWarning(false)
    }
  }, [open])

  const handleCloseAttempt = () => {
    if (isPending) {
      return
    }

    setShowCloseWarning(true)
  }

  const handleExit = () => {
    if (isPending) {
      return
    }

    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleCloseAttempt()
          return
        }

        onOpenChange(true)
      }}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden p-0"
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          event.preventDefault()
          handleCloseAttempt()
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          handleCloseAttempt()
        }}
        onInteractOutside={(event) => {
          event.preventDefault()
          handleCloseAttempt()
        }}
      >
        <DialogHeader className="border-b px-6 py-5 text-center">
          <DialogTitle className="text-lg text-center">
            Choose Your Workspace
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {showCloseWarning && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />

              <AlertDescription>
                Please select a workspace before continuing.
              </AlertDescription>
            </Alert>
          )}

          <ScrollArea className="h-52 w-full">
            <div className="px-4 grid max-w-md grid-cols-3 gap-4 sm:grid-cols-4">
              {workspaces.map((workspace) => (
                <WorkspaceCard key={workspace.slug} workspace={workspace} />
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={handleExit}
          >
            <X className="size-4" />
            Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
