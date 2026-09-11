'use client'

import { Button } from '@/shared/ui/button'

type RolesEmptyStateProps = {
  title?: string
  description?: string
  onReset?: () => void
  showReset?: boolean
}

export function RolesEmptyState({
  title = 'No custom roles found',
  description = 'Create your first custom role to get started.',
  onReset,
  showReset = false,
}: RolesEmptyStateProps) {
  return (
    <div className="rounded-2xl border p-8 text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm">{description}</p>

      {showReset && onReset ? (
        <div className="mt-6">
          <Button type="button" variant="outline" onClick={onReset}>
            Clear search
          </Button>
        </div>
      ) : null}
    </div>
  )
}