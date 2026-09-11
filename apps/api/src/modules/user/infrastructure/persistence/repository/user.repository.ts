import { Injectable, Logger } from '@nestjs/common'
import { Model, UpdateQuery, QueryFilter } from 'mongoose'
import type {
  FindUsersQuery,
  IUserRepository,
} from '@/modules/user/application/repository/user.repository.interface'
import { UserStatus, type User } from '@/modules/user/domain'
import type { Email } from '@/modules/user/domain'
import type { UserId } from '@/modules/user/domain'
import {
  UserModel,
  type UserDocument,
} from '@/modules/user/infrastructure/persistence/schema/user.schema'
import { UserMapper } from '@/modules/user/application/mappers/user.mapper'
import { InjectModel } from '@nestjs/mongoose'
import { ITransactionOptions } from '@/shared/application/ports/transaction-manager.interface'
import { PaginatedResult } from '@/shared/application'

/**
 * MongoDB User Repository Implementation (Adapter)
 *
 * INFRASTRUCTURE LAYER - Implements the IUserRepository port
 *
 * This is an ADAPTER that implements the PORT defined in Application layer.
 * It handles all MongoDB-specific persistence logic.
 */
@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name)

  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async save(user: User, options?: ITransactionOptions): Promise<void> {
    const persistenceData = UserMapper.toPersistence(user)
    const querySession = options?.session

    const existingUserQuery = this.userModel.findOne({
      id: user.userId.value,
    })

    if (querySession) {
      existingUserQuery.session(querySession)
    }

    const existingUser = await existingUserQuery

    const updateOperation: UpdateQuery<UserDocument> = {
      $set: persistenceData,
    }

    if (user.lockedUntil === undefined) {
      updateOperation.$unset = { lockedUntil: 1 }
    }

    if (existingUser) {
      const updateQuery = this.userModel.updateOne(
        { id: user.userId.value },
        updateOperation
      )

      if (querySession) {
        updateQuery.session(querySession)
      }

      await updateQuery
      this.logger.debug(`Updated user: ${user.userId.value}`)
      return
    }

    const newUser = new this.userModel(persistenceData)
    await newUser.save(querySession ? { session: querySession } : undefined)
    this.logger.debug(`Created user: ${user.userId.value}`)
  }

  async findById(id: UserId): Promise<User | null> {
    const document = await this.userModel.findOne({
      id: id.value,
      deletedAt: null,
    })

    if (!document) {
      return null
    }

    return UserMapper.toDomain(document)
  }

  async findAll({
    limit,
    page,
    search,
    status,
  }: FindUsersQuery): Promise<PaginatedResult<User[] | []>> {
    const skip = (page - 1) * limit

    const filter: QueryFilter<UserDocument> = {}

    if (status) filter.status = status

    if (search?.trim()) {
      const keyword = search.trim()

      filter.$or = [
        {
          firstName: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          lastName: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          displayName: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: keyword,
            $options: 'i',
          },
        },
      ]
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(),
    ])

    return {
      data: data.map((doc) => UserMapper.toDomain(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    const document = await this.userModel.findOne({
      email: email.value,
      deletedAt: null,
    })

    if (!document) {
      return null
    }

    return UserMapper.toDomain(document)
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const isExist = await this.userModel.exists({
      email: email.value,
      deletedAt: null,
    })

    return !!isExist
  }

  async delete(id: UserId): Promise<void> {
    await this.userModel.updateOne(
      { id: id.value },
      { $set: { deletedAt: new Date(), status: UserStatus.DELETED } }
    )
    this.logger.debug(`Soft deleted user: ${id.value}`)
  }
}
