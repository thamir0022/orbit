'use client'

import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useRef } from 'react'
import { useSelectWorkspaceMutation } from '../model/use-select-workspace.mutation'

export const WorkSpaceLayout = ({
  children,
  slug,
}: {
  children: ReactNode
  slug: string
}) => {
  const router = useRouter()
  const workspace = useWorkspace()

  const {
    mutate: selectWorkspace,
    isPending,
    isError,
  } = useSelectWorkspaceMutation()

  const selectedSlugRef = useRef<string | null>(null)

  useEffect(() => {
    // Prevent duplicate selection for the same slug.
    if (selectedSlugRef.current === slug) {
      return
    }

    selectedSlugRef.current = slug

    selectWorkspace({ slug })
  }, [slug, selectWorkspace])

  useEffect(() => {
    if (isError) {
      router.replace('/workspaces')
    }
  }, [isError, router])

  if (isPending || !workspace || workspace.slug !== slug) {
    return (
      <div className="flex size-full items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <div className="min-h-full">{children}</div>
}
