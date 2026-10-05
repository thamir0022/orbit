'use client'

import { useParams } from 'next/navigation'

import { ProjectsPage } from '@/_pages/projects/ui/projects-page'

const Projects = () => {
  const params = useParams<{
    slug: string
  }>()

  return <ProjectsPage workspaceSlug={params.slug} />
}

export default Projects
