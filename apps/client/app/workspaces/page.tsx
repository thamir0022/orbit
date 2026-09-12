import { Suspense } from 'react'
import { WorkspaceSelectionView } from '@/widgets/workspace'
import { Loader2 } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Select Workspace | Orbit',
  description: 'Choose a workspace to continue.',
}

export default function WorkspacesPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 sm:py-32 lg:px-8">
      {/* Suspense boundary allows Next.js to stream the shell immediately
        while the serverFetch resolves in the background.
      */}
      <Suspense
        fallback={
          <div className="flex h-100 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <WorkspaceSelectionView />
      </Suspense>
    </main>
  )
}
