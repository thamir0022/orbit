import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  OrganizationModel,
  OrganizationSchema,
} from './infrastructure/persistence/schema/organization.schema'
// import { OrganizationController } from './presentation/controllers/organization.controller'
import { organizationProviders } from './infrastructure/providers/organization.providers'
import {
  ORGANIZATION_MEMBER_REPOSITORY,
  ORGANIZATION_REPOSITORY,
} from './application'
import {
  OrganizationMemberModel,
  OrganizationMemberSchema,
} from './infrastructure/persistence/schema/organization-member.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationModel.name, schema: OrganizationSchema },
      { name: OrganizationMemberModel.name, schema: OrganizationMemberSchema },
    ]),
  ],
  // controllers: [OrganizationController],
  providers: [
    ...organizationProviders,
    // { provide: CREATE_ORGANIZATION, useClass: CreateOrganizationUseCase },
  ],
  exports: [ORGANIZATION_REPOSITORY, ORGANIZATION_MEMBER_REPOSITORY],
})
export class OrganizationModule {}
