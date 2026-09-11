import 'reflect-metadata'

import prompts from 'prompts'
import { NestFactory } from '@nestjs/core'

import { AdminModule } from '@/cli/modules/admin.module'
import {
  CREATE_PLATFORM_ADMIN_USE_CASE,
  type ICreatePlatformAdminUseCase,
} from '@/modules/platform-admin/application/usecases/create-platform-admin.interface'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AdminModule)

  interface CreatePlatformAdminAnswers {
    firstName: string
    lastName: string
    email: string
    password: string
  }
  try {
    const useCase = app.get<ICreatePlatformAdminUseCase>(
      CREATE_PLATFORM_ADMIN_USE_CASE
    )

    const answers = (await prompts(
      [
        {
          type: 'text',
          name: 'firstName',
          message: 'First name',
          validate: (value: string) =>
            value.trim().length > 0 ? true : 'First name is required',
        },
        {
          type: 'text',
          name: 'lastName',
          message: 'Last name',
          validate: (value: string) =>
            value.trim().length > 0 ? true : 'Last name is required',
        },
        {
          type: 'text',
          name: 'email',
          message: 'Email',
          validate: (value: string) =>
            value.trim().length > 0 ? true : 'Email is required',
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password',
          validate: (value: string) =>
            value.trim().length > 0 ? true : 'Password is required',
        },
      ],
      {
        onCancel: () => {
          throw new Error('Operation cancelled')
        },
      }
    )) as CreatePlatformAdminAnswers

    const result = await useCase.execute({
      firstName: answers.firstName,
      lastName: answers.lastName,
      email: answers.email,
      password: answers.password,
    })

    console.log('\n✅ Platform administrator created successfully')
    console.log(`User ID : ${result.userId}`)
    console.log(`Email   : ${result.email}`)
  } catch (error) {
    console.error('\n❌ Failed to create platform administrator')

    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }

    process.exitCode = 1
  } finally {
    await app.close()
  }
}

void bootstrap()
