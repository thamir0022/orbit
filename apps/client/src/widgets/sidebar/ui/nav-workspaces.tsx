'use client'
import { useUserWorkspaces } from '@/entities/workspace/api/use-user-workspaces'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar'
import { Building2, ChevronsUpDown, Loader, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const NavWorkspaces = () => {
  const workspace = useWorkspace()
  const { data, isPending } = useUserWorkspaces()

  console.log('DATA : ', data);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="font-semibold cursor-pointer">
              <Building2 />
              {workspace?.name}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
            {isPending ? (
              <DropdownMenuItem className="flex items-center justify-center">
                <Loader className="size-5 animate-spin" />
              </DropdownMenuItem>
            ) : (
              data?.workspaces &&
              data.workspaces.map((w) => (
                <Link key={w.slug} href={`/${w.slug}/overview`}>
                  <DropdownMenuItem>
                    {w.logoUrl ? (
                      <Image
                        className="size-5"
                        src={w.logoUrl}
                        alt={`${w.name}'s logo`}
                      />
                    ) : (
                      <span className="border rounded-sm">
                        <Building2 />
                      </span>
                    )}
                    {w.name}
                  </DropdownMenuItem>
                </Link>
              ))
            )}
            <Link href="/workspaces/new">
              <DropdownMenuItem>
                <span className="border rounded-sm">
                  <Plus />
                </span>
                New Workspace
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default NavWorkspaces
