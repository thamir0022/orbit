'use client'

import { LogOut } from 'lucide-react'
import { useSignOutMutation } from '../modal/use-sign-out.mutation'
import { Button } from '@/shared/ui/button'

export function SignOutButton() {
  const { mutate: signOut, isPending } = useSignOutMutation()

  return (
    <Button
      onClick={() => signOut()}
      isLoading={isPending}
      className="flex w-full items-center px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
