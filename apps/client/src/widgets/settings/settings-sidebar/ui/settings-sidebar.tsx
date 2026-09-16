'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/shared/ui/sidebar'
import { getSettingsRoute } from '@/entities/settings'
import { settingsSidebarConfig } from '@/entities/settings'

export function SettingsSidebar() {
  const pathname = usePathname()

  const { slug } = useParams<{
    slug: string
  }>()

  return (
    <Sidebar variant="floating" collapsible="none" className="max-h-full border-r">
      <SidebarHeader className="px-4 py-6">
        <h3 className="text-xl font-semibold">Settings</h3>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarMenu>
          {settingsSidebarConfig.map((item) => {
            const href = getSettingsRoute(item.key, slug)

            return (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton asChild isActive={pathname === href}>
                  <Link href={href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
