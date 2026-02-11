import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { ResponseInterceptor } from './shared/presentation/intercepters/response.intercepter'
import { APP_CONFIG, IAppConfig } from './shared/infrastructure'

/**
 * Bootstraps, configures, and starts the NestJS application using the application configuration.
 *
 * Configures a global API prefix and validation pipe, enables CORS with configured origins and credentials, applies cookie parsing and a global response interceptor, sets up Swagger UI at `/api/docs`, and starts listening on the configured port (defaults to 5000).
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  const config = app.get<IAppConfig>(APP_CONFIG)

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )

  // CORS
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  })

  app.use(cookieParser())

  // Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor())

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Orbit API')
    .setDescription('Comprehensive Project Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  const PORT = config.port ?? 5000

  await app.listen(PORT)

  logger.log(`🚀 Orbit API is running on: ${await app.getUrl()}`)
  logger.log(`📚 Swagger docs available at: ${await app.getUrl()}/api/docs`)
}

void bootstrap()