import { Separator } from '@/shared/ui/separator'
import Link from 'next/link'

export function TermsAndPrivacy() {
  return (
    <div className="absolute bottom-8 flex items-center gap-2 text-sm h-5 font-medium">
      <Link href="#">Terms</Link>
      <Separator orientation="vertical" />
      <Link href="#">Privacy Policy</Link>
    </div>
  )
}
