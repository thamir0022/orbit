'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react' // Or your preferred icon library

import { initializeSessionApi } from '../api/initialize-session.api'
import { useUserStore } from '@/entities/user/model/user.store'
import { useOrganizationStore } from '@/entities/organization/model/organization.store'
import { rootDomain } from '@/shared/lib/utils'

interface SessionGuardProps {
  children: React.ReactNode
}

export function SessionGuard({ children }: SessionGuardProps) {
  // Connect to our Zustand actions
  const setUser = useUserStore((state) => state.setUser)
  const setOrganization = useOrganizationStore((state) => state.setOrganization)
  const signOut = useUserStore((state) => state.signOut)

  const { data, isPending, isError } = useQuery({
    queryKey: ['session', 'init'],
    queryFn: initializeSessionApi,
    // We only want to run this once per hard page load.
    // Subsequent fetches should be handled by specific invalidations.
    staleTime: Infinity,
    retry: false, // Don't retry if the refresh token is missing/expired
  })

  // Hydrate the Zustand stores when data arrives
  React.useEffect(() => {
    if (data) {
      setUser(data.user)
      setOrganization(data.organization)
    }
  }, [data, setUser, setOrganization])

  // Handle unauthorized or failed session states
  React.useEffect(() => {
    if (isError) {
      signOut()
      // Hard redirect to your main domain's login page
      // e.g., https://orbit.com/sign-in
      const protocol = window.location.protocol
      window.location.assign(`${protocol}//${rootDomain}/sign-in`)
    }
  }, [isError, signOut])

  // 1. Show the full-screen loader while establishing the session
  if (isPending) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
          Loading workspace...
        </p>
      </div>
    )
  }

  // 2. Prevent rendering children if there's an error (redirect is handling it)
  if (isError) {
    return null
  }

  // 3. Render the protected application
  return <>{children}</>
}
