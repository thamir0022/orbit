import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'

@Injectable()
export class WorkspaceInvitationTokenPipe implements PipeTransform<
  string,
  string
> {
  private static readonly TOKEN_REGEX = /^[a-f0-9]{64}$/i

  transform(value: string): string {
    if (!WorkspaceInvitationTokenPipe.TOKEN_REGEX.test(value)) {
      throw new BadRequestException('Invalid workspace invitation token.')
    }

    return value
  }
}
