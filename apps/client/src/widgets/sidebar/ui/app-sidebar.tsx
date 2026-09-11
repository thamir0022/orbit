'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/shared/ui/sidebar'
import OrbitLogo from '@/shared/ui/orbit-logo'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { sidebarConfig } from '../model/sidebar.config'
import NavWorkspaces from './nav-workspaces'

export function AppSidebar({
  variant,
  slug,
}: {
  slug: string
  variant: 'sidebar' | 'floating' | 'inset'
}) {
  const { open } = useSidebar()

  return (
    <Sidebar className="h-full border-r" variant={variant} collapsible="icon">
      <SidebarHeader>
        <OrbitLogo variant={open ? 'logo_and_brand_name' : 'logo'} />
        <NavWorkspaces />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavGroup
          title="Workspace"
          items={sidebarConfig.workspace.map((item) => ({
            ...item,
            url: `/${slug}/${item.path}`,
          }))}
        />
        <SidebarSeparator />
        <NavGroup
          title="Collaboration"
          items={sidebarConfig.collaboration.map((item) => ({
            ...item,
            url: `/${slug}/${item.path}`,
          }))}
        />
        <SidebarSeparator />
        <NavGroup
          title="System"
          items={sidebarConfig.system.map((item) => ({
            ...item,
            url: `/${slug}/${item.path}`,
          }))}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
