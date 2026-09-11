import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { RolePermissionRepository } from '../../application/repositories/role-permission.repository'
import {
  RolePermissionDocument,
  RolePermissionModel,
} from '../schemas/role-permission.schema'
import { Model } from 'mongoose'
import { RolePermission } from '../../domain/entities/role-permission.entity'
import { RoleId } from '../../domain/value-objects/role-id.vo'
import { PermissionId } from '../../domain/value-objects/permission-id.vo'
import { PermissionStatus } from '../../domain/enums/permission-status.enum'
import { ITransactionOptions } from '@/shared/application'

@Injectable()
export class MongoRolePermissionRepository implements RolePermissionRepository {
  private readonly logger = new Logger(MongoRolePermissionRepository.name)
  constructor(
    @InjectModel(RolePermissionModel.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>
  ) {}

  async save(
    rolePermission: RolePermission,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.rolePermissionModel
      .findOneAndUpdate(
        {
          id: rolePermission.id.value,
        },
        {
          id: rolePermission.id,
          roleId: rolePermission.roleId,
          permissionId: rolePermission.permissionId,
        },
        {
          session: options?.session,
          upsert: true,
        }
      )
      .exec()
  }

  async saveMany(
    rolePermissions: RolePermission[],
    options?: ITransactionOptions
  ): Promise<void> {
    if (rolePermissions.length === 0) {
      return
    }

    await this.rolePermissionModel.bulkWrite(
      rolePermissions.map((rolePermission) => ({
        updateOne: {
          filter: {
            id: rolePermission.id.value,
          },
          update: {
            $set: {
              id: rolePermission.id.value,
              roleId: rolePermission.roleId.value,
              permissionId: rolePermission.permissionId.value,
              createdAt: rolePermission.createdAt,
            },
          },
          upsert: true,
        },
      })),
      {
        session: options?.session,
        ordered: true,
      }
    )
  }

  async exists(roleId: RoleId, permissionId: PermissionId): Promise<boolean> {
    const count = await this.rolePermissionModel
      .countDocuments({
        roleId: roleId.value,
        permissionId: permissionId.value,
      })
      .exec()

    return count > 0
  }

  async findPermissionsByRoleId(roleId: RoleId): Promise<string[]> {
    const documents = await this.rolePermissionModel
      .find({
        roleId: roleId.value,
      })
      .lean()
      .exec()

    return documents.map((doc) => doc.permissionId)
  }

  async findPermissionKeysByRoleId(roleId: string): Promise<string[]> {
    try {
      const result = await this.rolePermissionModel
        .aggregate<{
          keys: string[]
        }>([
          {
            $match: {
              roleId,
            },
          },
          {
            $lookup: {
              from: 'permissions',
              localField: 'permissionId',
              foreignField: 'id',
              pipeline: [
                {
                  $match: {
                    status: PermissionStatus.ACTIVE,
                  },
                },
                {
                  $project: {
                    _id: 0,
                    key: 1,
                  },
                },
              ],
              as: 'permission',
            },
          },
          {
            $unwind: '$permission',
          },
          {
            $group: {
              _id: null,
              keys: {
                $addToSet: '$permission.key',
              },
            },
          },
          {
            $project: {
              _id: 0,
              keys: 1,
            },
          },
        ])
        .exec()

      this.logger.debug('RESULT FROM MONGODB AGGREGATE : ', result[0]?.keys)

      return result[0]?.keys ?? []
    } catch (error) {
      this.logger.error(
        `Failed to resolve permission keys for role ${roleId}`,
        error
      )

      throw error
    }
  }

  async replacePermissions(
    roleId: string,
    permissionIds: string[],
    options?: ITransactionOptions
  ): Promise<void> {
    await this.rolePermissionModel.deleteMany({
      roleId,
    })

    if (permissionIds.length === 0) {
      return
    }

    const rolePermissions = permissionIds.map((permissionId) =>
      RolePermission.create({
        roleId: RoleId.fromString(roleId),
        permissionId: PermissionId.fromString(permissionId),
      })
    )

    await this.rolePermissionModel.insertMany(
      rolePermissions.map((rolePermission) => ({
        id: rolePermission.id.value,
        roleId: rolePermission.roleId.value,
        permissionId: rolePermission.permissionId.value,
        createdAt: rolePermission.createdAt,
      })),
      { session: options?.session }
    )
  }

  async delete(roleId: RoleId, permissionId: PermissionId): Promise<void> {
    await this.rolePermissionModel
      .deleteOne({
        roleId: roleId.value,
        permissionId: permissionId.value,
      })
      .exec()
  }

  async deleteMany(
    roleId: RoleId,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.rolePermissionModel
      .deleteMany(
        {
          roleId: roleId.value,
        },
        { session: options?.session }
      )
      .exec()
  }
}
