import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  MessageSquare,
  Settings,
} from 'lucide-react'

export const sidebarConfig = {
  workspace: [
    {
      title: 'Overview',
      path: 'overview',
      icon: LayoutDashboard,
    },
    {
      title: 'Projects',
      path: 'projects',
      icon: FolderKanban,
    },
    {
      title: 'Teams',
      path: 'tasks',
      icon: CheckSquare,
    },
  ],

  collaboration: [
    {
      title: 'Team',
      path: 'team',
      icon: Users,
    },
    {
      title: 'Messages',
      path: 'messages',
      icon: MessageSquare,
    },
  ],

  system: [
    {
      title: 'Settings',
      path: 'settings',
      icon: Settings,
    },
  ],
}