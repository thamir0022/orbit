import type { ReactNode } from 'react'

import { TeamRouteProvider } from '@/widgets/team-route'

type TeamLayoutProps = {
  readonly children: ReactNode
  readonly params: Promise<{
    slug: string
    teamKey: string
  }>
}

/** Shared layout for the Team overview and every team-scoped destination. */
export default async function TeamLayout({
  children,
  params,
}: TeamLayoutProps) {
  const { slug, teamKey } = await params

  return (
    <TeamRouteProvider workspaceSlug={slug} teamKey={teamKey}>
      {children}
    </TeamRouteProvider>
  )
}
