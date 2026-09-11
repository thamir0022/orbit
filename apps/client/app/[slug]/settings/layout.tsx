import { SettingsSidebar } from '@/widgets/settings-sidebar'

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex size-full">
      <SettingsSidebar />
      <main className="flex-1 p-2">{children}</main>
    </div>
  )
}
