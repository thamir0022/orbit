import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

interface ProfileHeaderProps {
  firstName?: string
  lastName?: string
  displayName?: string
  avatarUrl?: string | null
}

const getInitials = (firstName?: string, lastName?: string) => {
  const firstInitial = firstName?.charAt(0) ?? ''
  const lastInitial = lastName?.charAt(0) ?? ''

  return `${firstInitial}${lastInitial}`.toUpperCase() || 'U'
}

export const ProfileHeader = ({
  firstName,
  lastName,
  displayName,
  avatarUrl,
}: ProfileHeaderProps) => {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim()

  const initials = getInitials(firstName, lastName)

  return (
    <div className="overflow-hidden rounded-xl">
      {/* Cover */}
      <div className="h-32 bg-linear-to-br from-muted via-muted/60 to-muted/30 sm:h-36" />

      {/* Profile content */}
      <div className="relative px-5 pb-5 sm:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Avatar className="size-24 border-4 border-background shadow-sm sm:size-28">
            <AvatarImage
              src={avatarUrl ?? undefined}
              alt={displayName || fullName || 'Profile'}
            />

            <AvatarFallback className="text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {displayName || fullName || 'Your name'}
          </h2>

          <p className="text-muted-foreground text-sm">Software Engineer</p>
        </div>
      </div>
    </div>
  )
}
