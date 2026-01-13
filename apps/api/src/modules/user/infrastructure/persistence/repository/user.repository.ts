import { Injectable, Logger } from '@nestjs/common'
import type { Model } from 'mongoose'
import type { IUserRepository } from '@/modules/user/application'
import type { User } from '@/modules/user/domain'
import type { Email } from '@/modules/user/domain'
import type { UserId } from '@/modules/user/domain'
import { UserModel, type UserDocument } from '@/modules/user/infrastructure/persistence/schema/user.schema'
import { UserMapper } from '@/modules/user/application'
import { InjectModel } from '@nestjs/mongoose'

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

  async save(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user)

    const existingUser = await this.userModel.findOne({
      id: user.userId.value,
    })

    if (existingUser) {
      await this.userModel.updateOne(
        { id: user.userId.value },
        { $set: persistenceData }
      )
      this.logger.debug(`Updated user: ${user.userId.value}`)
    } else {
      const newUser = new this.userModel(persistenceData)
      await newUser.save()
      this.logger.debug(`Created user: ${user.userId.value}`)
    }

    return user
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
    const count = await this.userModel.countDocuments({
      email: email.value,
      deletedAt: null,
    })

    return count > 0
  }

  async delete(id: UserId): Promise<void> {
    await this.userModel.updateOne(
      { id: id.value },
      { $set: { deletedAt: new Date(), status: 'deleted' } }
    )
    this.logger.debug(`Soft deleted user: ${id.value}`)
  }
}
