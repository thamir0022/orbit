import {
  Body,
  Controller,
  Get,
  Inject,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  GET_CURRENT_USER,
  type IGetCurrentUserUseCase,
} from '../../application/usecases/current-user.interface'
import { CurrentIdentity } from '@/shared/presentation/decorators/current-identity.decorator'
import { type RefreshTokenPayload } from '@/shared/domain/types'
import { RefreshTokenGuard } from '@/shared/infrastructure/security/guards/refresh-token.guard'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { UserResponseMessages } from '../enums/response-messages.enum'
import {
  CurrentUserResponseDto,
  EditUserProfileRequest,
  EditUserProfileResponse,
} from '../dtos'
import { RequirePermissions } from '@/shared/infrastructure/security/decorators/require-permissions.decorator'
import {
  GET_ALL_USERS,
  type IGetAllUsersUseCase,
} from '../../application/usecases/get-all-users.interface'
import {
  EDIT_USER_PROFILE_USECASE,
  type IEditUserProfileUseCase,
} from '../../application/usecases/edit-user-profile.interface'

@Controller('users')
export class UserController {
  constructor(
    @Inject(GET_CURRENT_USER)
    private readonly getCurrentUserUseCase: IGetCurrentUserUseCase,
    @Inject(GET_ALL_USERS)
    private readonly getAllUserUseCase: IGetAllUsersUseCase,
    @Inject(EDIT_USER_PROFILE_USECASE)
    private readonly editUserProfileUseCase: IEditUserProfileUseCase
  ) {}

  @Get('me')
  @UseGuards(RefreshTokenGuard)
  @ResponseMessage(UserResponseMessages.GET_USER_SUCCESS)
  async getCurrentUser(
    @CurrentIdentity() identity: RefreshTokenPayload
  ): Promise<CurrentUserResponseDto> {
    return this.getCurrentUserUseCase.execute({ userId: identity.sub })
  }

  @UseGuards(RefreshTokenGuard)
  @Put()
  async editUserProfile(
    @Body() request: EditUserProfileRequest,
    @CurrentIdentity() identity: RefreshTokenPayload
  ): Promise<EditUserProfileResponse> {
    return await this.editUserProfileUseCase.execute({
      firstName: request.firstName,
      lastName: request.lastName,
      displayName: request.displayName,
      userId: identity.sub,
    })
  }

  @Get()
  @UseGuards(RefreshTokenGuard)
  @RequirePermissions()
  @ResponseMessage(UserResponseMessages.GET_ALL_USERS_SUCCESS)
  async getAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.getAllUserUseCase.execute({ limit, page })
  }
}
