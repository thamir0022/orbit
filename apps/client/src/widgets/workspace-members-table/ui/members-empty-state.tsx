'use client'

import { Button } from '@/shared/ui/button'

type MembersEmptyStateProps = {
  title?: string
  description?: string
  showReset?: boolean
  onReset?: () => void
}

export function MembersEmptyState({
  title = 'No workspace members found',
  description = 'Try adjusting your search or filters.',
  showReset = false,
  onReset,
}: MembersEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm ">{description}</p>

      {showReset && onReset ? (
        <div className="mt-6">
          <Button variant="outline" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  )
}
