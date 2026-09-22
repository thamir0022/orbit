import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { LogOut } from 'lucide-react'
import { useSignOutMutation } from '../modal/use-sign-out.mutation'

export function SignOutButton() {
  const { mutate: signOut, isPending } = useSignOutMutation()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={isPending}
          className={cn(
            'h-7 gap-1.5 border-red-500/20',
            'bg-red-500/5 px-2.5',
            'text-red-500/80',
            'hover:border-red-500/30',
            'hover:bg-red-500/10',
            'hover:text-red-500',
            'dark:border-red-400/20',
            'dark:bg-red-400/5',
            'dark:text-red-400/80',
            'dark:hover:border-red-400/30',
            'dark:hover:bg-red-400/10',
            'dark:hover:text-red-300'
          )}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of Orbit?</AlertDialogTitle>

          <AlertDialogDescription>
            You&apos;ll be signed out of this device and will need to sign in
            again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={() => signOut()}
            disabled={isPending}
            className="
              bg-red-600
              text-white
              hover:bg-red-700
              focus-visible:ring-red-600
            "
          >
            {isPending ? 'Signing out...' : 'Sign out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
