import type { Metadata } from 'next'

import { InboxPage } from '@/_pages/inbox'

export const metadata: Metadata = {
  title: 'Inbox | Orbit',
  description: 'Your notifications and workspace updates',
}

/**
 * Workspace-scoped route for the global notification inbox.
 *
 * - Uses the existing workspace layout and authentication context.
 * - Delegates UI implementation to the FSD page layer.
 */
export default function Page() {
  return <InboxPage />
}
