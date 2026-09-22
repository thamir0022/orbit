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
import {
  CircleHelp,
  Cpu,
  Gamepad2,
  Monitor,
  Smartphone,
  Tablet,
  Tv2,
  Watch,
  X,
  type LucideIcon,
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'

import type {
  Session,
  SessionDeviceType,
} from '@/entities/session/model/session.types'
import { useActiveSessionQuery } from '@/entities/session/model/use-active-session.query'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const DEVICE_ICONS: Record<SessionDeviceType, LucideIcon> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  'smart-tv': Tv2,
  console: Gamepad2,
  wearable: Watch,
  embedded: Cpu,
  unknown: CircleHelp,
}

const formatDeviceLabel = (type: SessionDeviceType): string => {
  return type
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const ActiveSession = () => {
  const { data: sessions, isLoading, isError, error } = useActiveSessionQuery()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">Active sessions</h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Devices currently signed in to your account.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border">
        {isLoading ? (
          <SessionListSkeleton />
        ) : isError ? (
          <div className="px-4 py-6 text-sm text-destructive">
            {error.message || 'Unable to load sessions.'}
          </div>
        ) : sessions?.length ? (
          <div className="divide-y">
            {sessions.map((session) => (
              <SessionDevice key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No active sessions found.
          </div>
        )}
      </div>
    </section>
  )
}

interface SessionDeviceProps {
  session: Session
}

const SessionDevice = ({ session }: SessionDeviceProps) => {
  const { device, isCurrent, ipAddress, lastActiveAt } = session

  const DeviceIcon = DEVICE_ICONS[device.type] ?? DEVICE_ICONS.unknown

  const deviceLabel = formatDeviceLabel(device.type)

  const browserInfo = [device.browser, device.browserVersion]
    .filter(Boolean)
    .join(' ')

  const secondaryInfo = [device.operatingSystem, deviceLabel]
    .filter(Boolean)
    .join(' · ')

  const handleRevoke = () => {
    // TODO: call revoke session mutation here
    console.log('Revoke session:', session.id)
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3',
        'transition-colors hover:bg-muted/30',
        isCurrent && 'bg-muted/15'
      )}
    >
      {/* Device */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center',
          'rounded-md border bg-background',
          isCurrent && 'border-primary/20'
        )}
      >
        <DeviceIcon
          className="size-3.5 text-muted-foreground"
          strokeWidth={1.8}
        />
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[13px] font-medium">
            {browserInfo || deviceLabel}
          </p>

          {isCurrent && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              This device
            </span>
          )}
        </div>

        <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">{secondaryInfo}</span>

          <span aria-hidden>·</span>

          <span className="shrink-0">
            Last active{' '}
            {formatDistanceToNow(parseISO(String(lastActiveAt)), {
              addSuffix: true,
            })}
          </span>

          {ipAddress && (
            <>
              <span aria-hidden>·</span>

              <span className="hidden shrink-0 sm:inline">IP {ipAddress}</span>
            </>
          )}
        </div>
      </div>

      {/* Revoke */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="xs"
            variant="outline"
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
            <X className="size-3" />
            Revoke
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this session?</AlertDialogTitle>

            <AlertDialogDescription>
              This will sign out{' '}
              <span className="font-medium text-foreground">
                {browserInfo || deviceLabel}
              </span>{' '}
              on {device.operatingSystem || 'this device'}. The session will no
              longer be able to access your account.
              {isCurrent && (
                <>
                  {' '}
                  Since this is your current device, you will also be signed out
                  here.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleRevoke}
              className="
                bg-red-600
                text-white
                hover:bg-red-700
                focus-visible:ring-red-600
              "
            >
              Revoke session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const SessionListSkeleton = () => {
  return (
    <div className="divide-y">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          <div className="size-8 animate-pulse rounded-md bg-muted" />

          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>

          <div className="h-6 w-14 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
