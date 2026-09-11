import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import {
  JoinedUserRoleResult,
  UserRoleRepository,
} from '../../application/repositories/user-role.repository'
import { UserRole } from '../../domain/entities/user-role.entity'
import { UserRoleId } from '../../domain/value-objects/user-role-id.vo'
import { RoleId } from '../../domain/value-objects/role-id.vo'
import { UserId } from '@/modules/user/domain'
import { UserRoleModel } from '../schemas/user-role.schema'
import { UserRoleMapper } from '../../application/mappers/user-role.mapper'
import { ITransactionOptions } from '@/shared/application'

@Injectable()
export class MongoUserRoleRepository implements UserRoleRepository {
  constructor(
    @InjectModel(UserRoleModel.name)
    private readonly model: Model<UserRoleModel>
  ) {}

  async findById(id: UserRoleId): Promise<UserRole | null> {
    const document = await this.model
      .findOne({
        userRoleId: id.value,
      })
      .exec()

    return document ? UserRoleMapper.toDomain(document) : null
  }

  async findByUserId(userId: UserId): Promise<UserRole | null> {
    const document = await this.model
      .findOne({
        userId: userId.value,
      })
      .exec()
    return document ? UserRoleMapper.toDomain(document) : null
  }

  async findRoleDetailsByUserId(
    userId: UserId
  ): Promise<JoinedUserRoleResult | null> {
    try {
      const result = await this.model.aggregate<JoinedUserRoleResult>([
        // 1. Target the specific user mapping using the indexed userId
        {
          $match: { userId: new Types.UUID(userId.value) },
        },

        // 2. Perform the DB-Level Join (O(1) if roles.id is indexed)
        {
          $lookup: {
            from: 'roles', // Match the collection name
            localField: 'roleId',
            foreignField: 'id',
            as: 'roleDetails',
          },
        },

        // 3. Flatten the joined array (Since it's a 1-to-1 global mapping)
        {
          $unwind: '$roleDetails',
        },

        // 4. (Optional) Security Check: Only return active roles
        {
          $match: { 'roleDetails.status': 'active' },
        },

        // 5. Projection: Select only necessary fields to minimize RAM overhead
        {
          $project: {
            _id: 0,
            id: 1,
            userId: 1,
            roleId: 1,
            'roleDetails.id': 1,
            'roleDetails.name': 1,
            'roleDetails.scope': 1,
            'roleDetails.status': 1,
            'roleDetails.isPredefined': 1,
          },
        },
      ])

      return result.length > 0 ? result[0] : null
    } catch {
      return null
    }
  }

  async exists(userId: UserId, roleId?: RoleId): Promise<boolean> {
    const userRole = await this.model
      .exists({
        userId: userId.value,
        ...(roleId && { roleId: roleId.value }),
      })
      .exec()

    return !!userRole
  }

  async save(entity: UserRole, options?: ITransactionOptions): Promise<void> {
    const document = UserRoleMapper.toPersistence(entity)

    await this.model.updateOne(
      {
        id: entity.roleId.value,
      },
      {
        $set: document,
      },
      {
        upsert: true,
        session: options?.session,
      }
    )
  }

  async delete(id: UserRoleId, options?: ITransactionOptions): Promise<void> {
    await this.model.deleteOne(
      {
        userRoleId: id.value,
      },
      {
        session: options?.session,
      }
    )
  }
}
