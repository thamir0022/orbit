'use client'

import { ProjectBrowser } from '@/widgets/project-browser/ui/project-browser'

interface ProjectsPageProps {
  readonly workspaceSlug: string
}

export const ProjectsPage = ({ workspaceSlug }: ProjectsPageProps) => {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 py-6">
      <ProjectBrowser workspaceSlug={workspaceSlug} />
    </main>
  )
}
