'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/shared/ui/button'

interface BackButtonProps {
  readonly title?: string
  readonly fallbackHref?: string
}

export function BackButton({ title = 'Back', fallbackHref }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        if (window.history.length > 1) router.back()
        else if (fallbackHref) router.push(fallbackHref)
      }}
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {title}
    </Button>
  )
}
