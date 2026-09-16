'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'

import {
  editWorkspace,
  type EditWorkspacePayload,
} from '@/entities/workspace/api/edit-workspace.api'
import type { Workspace } from '@/entities/workspace'
import {
  useWorkspace,
  useWorkspaceActions,
} from '@/entities/workspace/model/workspace.store'
import { workspaceKeys } from '@/entities/workspace/model/workspace.keys'
import { toast } from 'sonner'

const replaceWorkspaceSlug = (pathname: string, newSlug: string) => {
  const segments = pathname.split('/')

  if (segments.length < 2) {
    return pathname
  }

  segments[1] = newSlug

  return segments.join('/')
}

export const useEditWorkspaceMutation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const currentWorkspace = useWorkspace()
  const { setWorkspace } = useWorkspaceActions()

  return useMutation({
    mutationFn: async (payload: EditWorkspacePayload): Promise<Workspace> => {
      const res = await editWorkspace(payload)

      toast(res.message)

      return res.data.workspace
    },

    onSuccess: (updatedWorkspace: Workspace) => {
      const previousSlug = currentWorkspace?.slug
      const nextSlug = updatedWorkspace.slug

      queryClient.setQueryData(workspaceKeys.current(), updatedWorkspace)

      setWorkspace(updatedWorkspace)

      if (previousSlug && nextSlug && previousSlug !== nextSlug) {
        const nextPathname = replaceWorkspaceSlug(pathname, nextSlug)

        router.replace(nextPathname)
      }
    },
  })
}
