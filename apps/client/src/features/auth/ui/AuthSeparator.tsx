import { Separator } from '@/shared/ui/separator'

export function AuthSeparator() {
  return (
    <div className="flex items-center gap-2">
      <Separator className="flex-1" />
      <span className="text-xs whitespace-nowrap font-medium">OR</span>
      <Separator className="flex-1" />
    </div>
  )
}
