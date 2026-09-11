import { NestFactory } from '@nestjs/core'
import { PermissionSynchronizerService } from '@/modules/authorization/system-permissions'
import { PermissionModule } from '@/cli/modules/permission.module'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(PermissionModule)

  try {
    const synchronizer = app.get(PermissionSynchronizerService)

    await synchronizer.synchronize()
  } finally {
    await app.close()
  }
}

void bootstrap()
