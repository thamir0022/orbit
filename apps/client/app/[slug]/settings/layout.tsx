import { ScrollArea } from '@/shared/ui/scroll-area'
import { SettingsSidebar } from '@/widgets/settings'

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="size-full grid grid-cols-4">
      <SettingsSidebar />
      <ScrollArea className="col-span-3 p-2 h-175">{children}</ScrollArea>
    </div>
  )
}
