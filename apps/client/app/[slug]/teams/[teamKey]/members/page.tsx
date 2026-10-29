import { TeamMembersPage } from '@/_pages/team/ui/team-members-page'

export default async function Page({
  params,
}: {
  readonly params: Promise<{ slug: string; teamKey: string }>
}) {
  const { slug, teamKey } = await params
  return <TeamMembersPage teamKey={teamKey} workspaceSlug={slug} />
}
