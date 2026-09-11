import {
  Bell,
  Building2,
  CreditCard,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { LuUserRoundPen } from 'react-icons/lu'

export const settingsSidebarConfig = [
  {
    key: 'general',
    title: 'General',
    icon: Settings,
  },
  {
    key: 'profile',
    title: 'Profile',
    icon: User,
  },
  {
    key: 'workspace',
    title: 'Workspace',
    icon: Building2,
  },
  {
    key: 'roles',
    title: 'Roles',
    icon: LuUserRoundPen,
  },
  {
    key: 'members',
    title: 'Members',
    icon: Users,
  },
  {
    key: 'billing',
    title: 'Billing',
    icon: CreditCard,
  },
  {
    key: 'notifications',
    title: 'Notifications',
    icon: Bell,
  },
] as const

export type SettingsRouteKey = (typeof settingsSidebarConfig)[number]['key']
