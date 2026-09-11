import { Injectable } from '@nestjs/common'
import {
  FindAllPermissionQuery,
  PermissionRepository,
} from '../../application/repositories/permission.repository'
import { InjectModel } from '@nestjs/mongoose'
import {
  PermissionDocument,
  PermissionModel,
} from '../schemas/permission.schema'
import { Model, QueryFilter } from 'mongoose'
import { Permission } from '../../domain/entities/permission.entity'
import { PermissionMapper } from '../../application/mappers/permission.mapper'
import { PermissionKey } from '../../domain/value-objects/permission-key.vo'
import { PermissionId } from '../../domain/value-objects/permission-id.vo'
import { RoleId } from '../../domain/value-objects/role-id.vo'
import {
  RolePermissionDocument,
  RolePermissionModel,
} from '../schemas/role-permission.schema'
import { PermissionStatus } from '../../domain/enums/permission-status.enum'

@Injectable()
export class MongoPermissionRepository implements PermissionRepository {
  constructor(
    @InjectModel(PermissionModel.name)
    private readonly permissionModel: Model<PermissionDocument>,

    @InjectModel(RolePermissionModel.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>
  ) {}

  async save(permission: Permission): Promise<void> {
    const data = PermissionMapper.toPersistence(permission)

    await this.permissionModel
      .findOneAndUpdate(
        {
          id: permission.permissionId.value,
        },
        data,
        {
          upsert: true,
        }
      )
      .exec()
  }

  async findById(id: string): Promise<Permission | null> {
    const document = await this.permissionModel.findOne({ id }).exec()

    return document ? PermissionMapper.toDomain(document) : null
  }

  async findKeysByRoleId(roleId: RoleId): Promise<string[]> {
    const rolePermissions = await this.rolePermissionModel.find(
      { roleId: roleId.value },
      { _id: 0, permissionId: 1 }
    )

    if (rolePermissions.length === 0) return []

    const permissionIds = rolePermissions.map(
      ({ permissionId }) => permissionId
    )

    const permissions = await this.permissionModel
      .find(
        { id: { $in: permissionIds }, status: PermissionStatus.ACTIVE },
        { _id: 0, key: 1 }
      )
      .lean()
      .exec()

    return permissions.map(({ key }) => key)
  }

  async findByIds(permissionIds: PermissionId[]): Promise<Permission[]> {
    const documents = await this.permissionModel
      .find({
        id: {
          $in: permissionIds.map((permissionId) => permissionId.value),
        },
      })
      .exec()

    return documents.map((document) => PermissionMapper.toDomain(document))
  }

  async findByKey(key: PermissionKey): Promise<Permission | null> {
    const document = await this.permissionModel
      .findOne({
        key: key.value,
      })
      .exec()

    return document ? PermissionMapper.toDomain(document) : null
  }

  async findAll({
    key,
    action,
    status,
    resourse,
  }: FindAllPermissionQuery): Promise<Permission[]> {
    const filter: QueryFilter<PermissionDocument> = {}

    if (key) filter.key = key.value
    if (action) filter.action = action
    if (status) filter.status = status
    if (resourse) filter.resource = resourse

    const documents = await this.permissionModel.find(filter).exec()

    return documents.map((doc) => PermissionMapper.toDomain(doc))
  }

  async delete(id: string): Promise<void> {
    await this.permissionModel.deleteOne({ id }).exec()
  }
}
