'use client'

import { cn } from '@/shared/lib/tiptap/tiptap-utils'
import './textarea.scss'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn('textarea', className)}
      {...props}
    />
  )
}

export { Textarea }
