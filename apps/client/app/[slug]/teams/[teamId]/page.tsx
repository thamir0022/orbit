import { TeamOverviewPage } from '@/_pages/team/ui/team-overview-page'

const Page = async ({ params }: { params: Promise<{ teamId: string }> }) => {
  const { teamId } = await params

  return <TeamOverviewPage teamId={teamId} />
}

export default Page
