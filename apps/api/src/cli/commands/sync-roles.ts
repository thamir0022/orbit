import { NestFactory } from '@nestjs/core'
import { RoleSynchronizerService } from '@/modules/authorization/system-roles/role-synchronizer.service'
import { RoleModule } from '../modules/role.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(RoleModule)

  try {
    const synchronizer = app.get(RoleSynchronizerService)

    await synchronizer.synchronize()
  } finally {
    await app.close()
  }
}

void bootstrap()
