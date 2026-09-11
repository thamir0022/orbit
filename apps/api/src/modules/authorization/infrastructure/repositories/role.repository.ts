import { Injectable } from '@nestjs/common'
import {
  FindWorkspaceRoleQuery,
  IRoleRepository,
} from '../../application/repositories/role.repository'
import { InjectModel } from '@nestjs/mongoose'
import { RoleDocument, RoleModel } from '../schemas/role.schema'
import { Model, QueryFilter } from 'mongoose'
import { RoleMapper } from '../../application/mappers/role.mapper'
import { Role } from '../../domain/entities/role.entity'
import { RoleName } from '../../domain/value-objects/role-name.vo'
import { WorkspaceId } from '@/modules/workspace/domain'
import { ITransactionOptions } from '@/shared/application'
import { RoleScope } from '../../domain/enums/role-scope.enum'
import { RoleStatus } from '../../domain/enums/role-status.enum'

@Injectable()
export class MongoRoleRepository implements IRoleRepository {
  constructor(
    @InjectModel(RoleModel.name)
    private readonly roleModel: Model<RoleDocument>
  ) {}

  async save(role: Role, options?: ITransactionOptions): Promise<void> {
    const data = RoleMapper.toPersistence(role)

    await this.roleModel
      .findOneAndUpdate(
        {
          id: role.id.value,
        },
        data,
        { session: options?.session, upsert: true }
      )
      .exec()
  }

  async findById(id: string): Promise<Role | null> {
    const document = await this.roleModel.findOne({ id }).exec()

    return document ? RoleMapper.toDomain(document) : null
  }

  async findByName(
    workspaceId: WorkspaceId,
    roleName: RoleName
  ): Promise<Role | null> {
    const document = await this.roleModel
      .findOne({
        workspaceId: workspaceId.value,
        name: roleName.value,
      })
      .exec()

    return document ? RoleMapper.toDomain(document) : null
  }

  async findByWorkspaceId(
    workspaceId: WorkspaceId,
    query?: FindWorkspaceRoleQuery
  ): Promise<Role[]> {
    const filter: QueryFilter<RoleModel> = { workspaceId: workspaceId.value }

    if (query?.name) filter.name = query.name.value
    if (query?.status) filter.status = query.status

    const documents = await this.roleModel.find(filter).exec()

    return documents.map((doc) => RoleMapper.toDomain(doc))
  }

  async findSystemRoleByName(roleName: RoleName): Promise<Role | null> {
    const doc = await this.roleModel
      .findOne({ name: roleName.value, isPredefined: true })
      .exec()

    return doc ? RoleMapper.toDomain(doc) : null
  }

  async findAssignableRoles(workspaceId: WorkspaceId): Promise<Role[]> {
    const docs = await this.roleModel.find({
      scope: RoleScope.WORKSPACE,
      status: RoleStatus.ACTIVE,
      $or: [
        {
          workspaceId: workspaceId.value,
        },
        {
          isPredefined: true,
        },
      ],
    })

    return docs.map((doc) => RoleMapper.toDomain(doc))
  }

  async delete(id: string, options?: ITransactionOptions): Promise<void> {
    await this.roleModel.deleteOne({ id }, { session: options?.session }).exec()
  }
}
