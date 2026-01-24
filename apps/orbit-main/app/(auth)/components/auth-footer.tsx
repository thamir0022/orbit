import { Separator } from '@orbit/ui/components/separator'
import Link from 'next/link'

export function AuthFooter() {
  return (
    <div className="absolute bottom-8 flex items-center gap-2 text-sm h-5 font-medium">
      <Link className="text-gray-700" href="#">
        Terms
      </Link>
      <Separator orientation="vertical" />
      <Link className="text-gray-700" href="#">
        Privacy Policy
      </Link>
    </div>
  )
}
