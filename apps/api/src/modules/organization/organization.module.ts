import { Module } from '@nestjs/common'
import { CREATE_ORGANIZATION } from './application/usecases/create-organization.interface'
import { CreateOrganizationUseCase } from './application/usecases/create-organization.usecase'
import { MongooseModule } from '@nestjs/mongoose'
import {
  OrganizationModel,
  OrganizationSchema,
} from './infrastructure/persistence/schema/organization.schema'
import { OrganizationContoller } from './presentation/controllers/organization.controller'
import { organizationProviders } from './infrastructure/providers/organization.providers'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationModel.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [OrganizationContoller],
  providers: [
    ...organizationProviders,
    { provide: CREATE_ORGANIZATION, useClass: CreateOrganizationUseCase },
  ],
})
export class OrganizationModule {}
