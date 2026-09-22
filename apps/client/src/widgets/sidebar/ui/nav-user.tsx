'use client'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDown,
  CreditCardIcon,
  LogOutIcon,
} from 'lucide-react'
import { SignOutButton } from '@/features/auth/sign-out/ui/sign-out-button'
import { useUser } from '@/entities/user/model/user.store'

export function NavUser() {
  const { displayName, email, avatarUrl } = useUser()!

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="flex gap-1 cursor-pointer">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={avatarUrl} alt="profile image" />
                  <AvatarFallback>{displayName[0]}</AvatarFallback>
                </Avatar>
              </Button>
              <div className="flex flex-1 flex-col text-sm">
                <span>{displayName}</span>
                <span className="font-semibold">{email}</span>
              </div>
              <ChevronsUpDown className="size-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <SignOutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
