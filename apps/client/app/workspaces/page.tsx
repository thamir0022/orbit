import { Metadata } from 'next'
import { SelectWorkspacePage } from '@/_pages/workspaces/select-workspace'

export const metadata: Metadata = {
  title: 'Select Workspace | Orbit',
  description: 'Choose a workspace to continue.',
}

export default function WorkspacesPage() {
  return <SelectWorkspacePage />
}
