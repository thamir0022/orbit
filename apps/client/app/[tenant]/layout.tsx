import { SessionGuard } from '@/features/auth/session/ui/SessionGuard'
import { ReactNode } from 'react'

export default function TenantLayout({ children }: { children: ReactNode }) {
  return <SessionGuard>{children}</SessionGuard>
}
