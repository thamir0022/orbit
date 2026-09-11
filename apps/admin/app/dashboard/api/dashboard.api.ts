// src/features/admin-dashboard/api/dashboard.api.ts
import axios from "axios";
import { axiosInstance } from "@/lib/axios.instance";

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

export const getAllWorkspacesApi = async (): Promise<WorkspacesPayload> => {
  try {
    const response = await axiosInstance.get<ApiResponse<WorkspacesPayload>>(
      "/workspaces/all",
    );
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) throw error.response?.data ?? error;
    throw error;
  }
};

export const getAllUsersApi = async (): Promise<UsersPayload> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<UsersPayload>>("users");
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) throw error.response?.data ?? error;
    throw error;
  }
};
