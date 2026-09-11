import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class WorkspaceListItemResponseDto {
  @ApiProperty({ example: 'Acme Corp' })
  name!: string

  @ApiProperty({ example: 'acme-corp' })
  slug!: string

  @ApiPropertyOptional({ example: 'https://cdn.orbit.com/logos/acme.png' })
  logoUrl?: string
}

export class GetUserWorkspacesResponseDto {
  workspaces!: WorkspaceListItemResponseDto[]
}
