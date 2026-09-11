"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Users,
  ShieldCheck,
  Layers3,
} from "lucide-react";
import {
  getAllUsersApi,
  getAllWorkspacesApi,
  type UserItem,
  type WorkspaceItem,
} from "./api/dashboard.api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../packages/ui/src/components/card";
import { Badge } from "../../../../packages/ui/src/components/badge";
import { Skeleton } from "../../../../packages/ui/src/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../packages/ui/src/components/table";
import { ScrollArea } from "../../../../packages/ui/src/components/scroll-area";
import { Separator } from "../../../../packages/ui/src/components/separator";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default";
    case "pending":
      return "secondary";
    case "blocked":
    case "suspended":
      return "destructive";
    default:
      return "outline";
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/40">
          <Icon className="h-5 w-5 text-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            {value}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersTable({ users }: { users: UserItem[] }) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Users</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest user records and account state
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full px-3">
          {users.length} total
        </Badge>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px]">User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice(0, 8).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusBadgeVariant(user.status)}
                      className="capitalize"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Badge variant="outline" className="gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function WorkspacesTable({ workspaces }: { workspaces: WorkspaceItem[] }) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Workspaces</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Workspace overview with ownership and plan details
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full px-3">
          {workspaces.length} total
        </Badge>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Workspace</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.slice(0, 8).map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">
                        {workspace.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {workspace.companySize.replaceAll("_", " ")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {workspace.slug}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {workspace.companyType}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusBadgeVariant(workspace.status)}
                      className="capitalize"
                    >
                      {workspace.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(workspace.createdAt)}
                  </TableCell>
                </TableRow>
              ))}

              {workspaces.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No workspaces found
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const {
    data: workspacesData,
    isLoading: isWorkspacesLoading,
    isError: isWorkspacesError,
  } = useQuery({
    queryKey: ["admin-dashboard", "workspaces"],
    queryFn: getAllWorkspacesApi,
  });

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useQuery({
    queryKey: ["admin-dashboard", "users"],
    queryFn: getAllUsersApi,
  });

  const workspaces = workspacesData?.workspaces ?? [];
  const users = usersData?.users ?? [];

  const stats = React.useMemo(() => {
    const activeWorkspaces = workspaces.filter(
      (item) => item.status === "active",
    ).length;
    const verifiedUsers = users.filter((item) => item.emailVerified).length;
    const activeUsers = users.filter((item) => item.status === "active").length;

    return [
      {
        title: "Total Users",
        value: users.length,
        description: `${verifiedUsers} verified accounts`,
        icon: Users,
      },
      {
        title: "Total Workspaces",
        value: workspaces.length,
        description: `${activeWorkspaces} currently active`,
        icon: Building2,
      },
      {
        title: "Verified Users",
        value: verifiedUsers,
        description: "Email verification completed",
        icon: ShieldCheck,
      },
      {
        title: "Active Users",
        value: activeUsers,
        description: "Accounts with active status",
        icon: Layers3,
      },
    ];
  }, [users, workspaces]);

  const loading = isWorkspacesLoading || isUsersLoading;
  const hasError = isWorkspacesError || isUsersError;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of users and workspaces across the platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="rounded-2xl">
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="mt-3 h-8 w-20" />
                  <Skeleton className="mt-2 h-4 w-40" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
              />
            ))}
      </div>

      {hasError ? (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="p-5 text-sm text-destructive">
            Failed to load dashboard data.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <UsersTable users={users} />
          <WorkspacesTable workspaces={workspaces} />
        </div>
      )}
    </div>
  );
}
