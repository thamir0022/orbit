export interface AuthorizationService {
  hasPermission(
    userId: string,
    workspaceId: string,
    permissionKey: string
  ): Promise<boolean>
}
