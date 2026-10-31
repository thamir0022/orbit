import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SESSION_AUTH_KEY } from '@/shared/presentation/decorators/session-auth.decorator'
import { IAuthService } from '../../application/services/auth.service.interface'
import { AccessTokenGuard } from './access-token.guard'
import { RefreshTokenGuard } from './refresh-token.guard'

describe('Pre-workspace session authentication', () => {
  const sessionGuard = { canActivate: jest.fn() }
  const authService = { verifyAccessToken: jest.fn() }
  const reflector = { getAllAndOverride: jest.fn() }
  const guard = new AccessTokenGuard(
    reflector as unknown as Reflector,
    authService as unknown as IAuthService,
    sessionGuard as unknown as RefreshTokenGuard
  )

  function context(cookies: Record<string, string>): ExecutionContext {
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ cookies, headers: {} }) }),
    } as unknown as ExecutionContext
  }

  beforeEach(() => {
    jest.resetAllMocks()
    reflector.getAllAndOverride.mockImplementation(
      (key: string) => key === SESSION_AUTH_KEY
    )
  })

  it('accepts a validated session before a workspace is selected', async () => {
    sessionGuard.canActivate.mockResolvedValue(true)
    const requestContext = context({ refresh_token: 'session-cookie' })

    await expect(guard.canActivate(requestContext)).resolves.toBe(true)
    expect(sessionGuard.canActivate).toHaveBeenCalledWith(requestContext)
    expect(authService.verifyAccessToken).not.toHaveBeenCalled()
  })

  it('rejects an invalid session even when a stale access cookie exists', async () => {
    sessionGuard.canActivate.mockRejectedValue(new UnauthorizedException())

    await expect(
      guard.canActivate(
        context({ refresh_token: 'invalid', access_token: 'old' })
      )
    ).rejects.toBeInstanceOf(UnauthorizedException)
    expect(authService.verifyAccessToken).not.toHaveBeenCalled()
  })

  it('does not allow session cookies on workspace-scoped endpoints', async () => {
    reflector.getAllAndOverride.mockReturnValue(false)

    await expect(
      guard.canActivate(context({ refresh_token: 'session-cookie' }))
    ).rejects.toThrow('Access token is missing')
    expect(sessionGuard.canActivate).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated pre-workspace requests', async () => {
    await expect(guard.canActivate(context({}))).rejects.toThrow(
      'Access token is missing'
    )
    expect(sessionGuard.canActivate).not.toHaveBeenCalled()
  })
})
