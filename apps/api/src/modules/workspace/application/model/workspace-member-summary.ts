/** Minimal user identity exposed to workspace member selectors. */
export interface WorkspaceMemberSummary {
  readonly id: string
  readonly firstName: string
  readonly lastName: string
  readonly displayName: string
  readonly avatarUrl: string | null
}
