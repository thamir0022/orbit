import { Body, Controller, Get, Inject, Put, Query } from '@nestjs/common'
import {
  GET_CURRENT_USER,
  type IGetCurrentUserUseCase,
} from '../../application/usecases/current-user.interface'
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
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'

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
  @ResponseMessage(UserResponseMessages.GET_USER_SUCCESS)
  async getCurrentUser(
    @CurrentAuth('userId') userId: string
  ): Promise<CurrentUserResponseDto> {
    return this.getCurrentUserUseCase.execute({ userId })
  }

  @Put()
  async editUserProfile(
    @Body() request: EditUserProfileRequest,
    @CurrentAuth('userId') userId: string
  ): Promise<EditUserProfileResponse> {
    return await this.editUserProfileUseCase.execute({
      firstName: request.firstName,
      lastName: request.lastName,
      displayName: request.displayName,
      userId,
    })
  }

  @Get()
  @RequirePermissions()
  @ResponseMessage(UserResponseMessages.GET_ALL_USERS_SUCCESS)
  async getAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.getAllUserUseCase.execute({ limit, page })
  }
}
