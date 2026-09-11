'use client'

import { getActiveWorkspaceApi } from '@/entities/workspace/api/get-active-workspace.api'
import {
  useWorkspace,
  useWorkspaceStore,
} from '@/entities/workspace/model/workspace.store'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

export const WorkSpaceLayout = ({
  children,
  slug,
}: {
  children: ReactNode
  slug: string
}) => {
  const router = useRouter()
  const workspace = useWorkspace()
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace)

  // 1. Fetch the Active Workspace (Relies on the HttpOnly tenant_token cookie)
  const { data, isPending, isError } = useQuery({
    queryKey: ['workspace', 'active', slug],
    queryFn: getActiveWorkspaceApi,
    retry: false, // If it fails, they likely don't have access
  })

  useEffect(() => {
    if (data?.workspace && data.workspace.id !== workspace?.id) {
      setWorkspace(data.workspace)
    }
  }, [data, workspace?.id, setWorkspace])

  console.log({data, isPending, isError});

  // 3. Security/Fallback routing
  useEffect(() => {
    if (isError) {
      // If the API throws a 401/403 (e.g., token expired and exchange failed),
      // kick them back to the workspace selection screen.
      // router.replace('/workspaces')
    }
  }, [isError, router])

  // 4. Loading State
  if (!workspace && isPending) {
    return (
      <div className="flex size-full items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!workspace) return null

  return <div className='min-h-full'>{children}</div>
}
