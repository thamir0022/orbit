import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/shared/ui/sidebar'
import { AppSidebar } from '@/widgets/sidebar/ui/app-sidebar'
import { WorkSpaceLayout } from '@/widgets/workspace/ui/workspace-layout'
import { ReactNode } from 'react'

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <WorkSpaceLayout key={slug} slug={slug}>
      <SidebarProvider>
        <AppSidebar slug={slug} variant="inset" />
        <SidebarTrigger />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </WorkSpaceLayout>
  )
}
