// components/app-sidebar.tsx
"use client";

import * as React from "react";
import {
  BarChart3,
  Bell,
  ChevronRight,
  CreditCard,
  Gauge,
  Shield,
  Settings2,
  Users,
  Workflow,
  FolderKanban,
  Boxes,
  LineChart,
  LifeBuoy,
  LogOut,
  Search,
  LayoutDashboard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../../../packages/ui/src/components/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../packages/ui/src/components/avatar";
import { Badge } from "../../../packages/ui/src/components/badge";
import { Button } from "../../../packages/ui/src/components/button";
import { Separator } from "../../../packages/ui/src/components/separator";

const mainNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Analytics", href: "/admin/analytics", icon: LineChart },
  { title: "Workspaces", href: "/admin/workspaces", icon: Boxes },
  { title: "Projects", href: "/admin/projects", icon: FolderKanban },
  { title: "Members", href: "/admin/members", icon: Users },
  { title: "Roles & Access", href: "/admin/access", icon: Shield },
];

const managementNav = [
  { title: "Billing", href: "/admin/billing", icon: CreditCard },
  { title: "Automation", href: "/admin/automation", icon: Workflow },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    badge: "12",
  },
  { title: "Settings", href: "/admin/settings", icon: Settings2 },
];

const reportsNav = [
  { title: "Overview", href: "/admin/reports", icon: BarChart3 },
  { title: "Performance", href: "/admin/reports/performance", icon: Gauge },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border/60 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin" className="flex items-center gap-3">
                {/* <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Shield className="size-5" />
                </div> */}
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Orbit Admin</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Control center
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>

                  {item.badge ? (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>Quick actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Search className="size-4" />
                  <span>Global search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LifeBuoy className="size-4" />
                  <span>Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <div className="rounded-2xl border bg-background/80 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src="/admin-avatar.png" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">Admin User</p>
                <Badge
                  variant="secondary"
                  className="h-5 rounded-full px-2 text-[10px]"
                >
                  Super Admin
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                admin@company.com
              </p>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="grid gap-2">
            <Button variant="ghost" size="sm" className="justify-start gap-2">
              <Settings2 className="size-4" />
              Account settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
