import type { ReactNode } from 'react'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/shared/ui/sidebar'

import { AppSidebar } from '@/widgets/sidebar/ui/app-sidebar'

import { WorkSpaceLayout } from '@/widgets/workspace/ui/workspace-layout'

interface WorkspaceLayoutProps {
  readonly children: ReactNode
  readonly params: Promise<{
    slug: string
  }>
}

const Layout = async ({ children, params }: WorkspaceLayoutProps) => {
  const { slug } = await params

  return (
    <WorkSpaceLayout key={slug} slug={slug}>
      <SidebarProvider className="flex h-full min-h-0 min-w-0 w-full overflow-hidden">
        <AppSidebar slug={slug} variant="inset" />

        <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 min-w-0 flex-1">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </WorkSpaceLayout>
  )
}

export default Layout
