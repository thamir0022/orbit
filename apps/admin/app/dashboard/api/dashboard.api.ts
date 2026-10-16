import { httpClient } from "@/lib/http";

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  error: null | unknown;
  timestamp: string;
  path: string;
  method: string;
};

export type WorkspaceStatus = "active" | "inactive" | "archived" | "suspended";
export type UserStatus = "active" | "inactive" | "blocked";

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  planId: string;
  companySize: string;
  companyType: string;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  status: UserStatus;
}

export interface WorkspacesPayload {
  workspaces: WorkspaceItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsersPayload {
  users: UserItem[];
  meta: {
    total: number;
    totalPages: number | null;
  };
}

export const getAllWorkspacesApi = async (): Promise<WorkspaceItem[]> => {
  const response = await httpClient.get<WorkspacesPayload>("/workspaces/all");
  return response.data.workspaces;
};

export const getAllUsersApi = async (): Promise<UserItem[]> => {
  const response = await httpClient.get<UsersPayload>("users");
  return response.data.users;
};
