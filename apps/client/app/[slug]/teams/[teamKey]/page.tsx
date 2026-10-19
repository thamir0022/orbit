import { TeamOverviewPage } from '@/_pages/team/ui/team-overview-page'

const Page = async ({ params }: { params: Promise<{ teamKey: string }> }) => {
  const { teamKey } = await params

  return <TeamOverviewPage teamKey={teamKey} />
}

export default Page
