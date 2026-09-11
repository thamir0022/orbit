import Link from 'next/link'
import { Building2, Plus } from 'lucide-react'
import type { WorkspaceListItem } from '@/entities/workspace/model/workspace.types'
import Image from 'next/image'

interface WorkspaceCardProps {
  workspace: WorkspaceListItem
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link
      href={`/${workspace.slug}/overview`}
      className="bg-gray-100/10 hover:bg-gray-100/30 delay-100 size-20 border-2 p-3 rounded-2xl"
    >
      <div className="flex flex-col items-center gap-2">
        {workspace.logoUrl ? (
          <Image
            src={workspace.logoUrl}
            alt={workspace.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <Building2 />
        )}

        <div>
          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {workspace.name}
          </h3>
        </div>
      </div>
    </Link>
  )
}

export function AddWorkspaceCard() {
  return (
    <Link
      href="/workspaces/new"
      className="flex items-center justify-center bg-gray-100/10 hover:bg-gray-100/30 delay-100 size-20 border-2 p-3 rounded-2xl"
    >
      <Plus className="size-10" />
    </Link>
  )
}
