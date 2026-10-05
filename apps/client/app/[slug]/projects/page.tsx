import { ProjectsPage } from '@/_pages/projects/ui/projects-page'

const Projects = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params

  return <ProjectsPage workspaceSlug={slug} />
}

export default Projects
