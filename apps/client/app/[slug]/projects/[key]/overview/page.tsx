import { ProjectOverviewPage } from '@/_pages/project-overview'

const ProjectPage = async ({
  params,
}: {
  params: Promise<{ key: string }>
}) => {
  const { key } = await params

  return <ProjectOverviewPage projectKey={key} />
}

export default ProjectPage
