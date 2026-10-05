'use client'

import { ProjectBrowser } from '@/widgets/project-browser/ui/project-browser'

interface ProjectsPageProps {
  readonly workspaceSlug: string
}

export const ProjectsPage = ({ workspaceSlug }: ProjectsPageProps) => {
  return (
    <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col px-6 pb-6">
      <ProjectBrowser workspaceSlug={workspaceSlug} />
    </main>
  )
}
