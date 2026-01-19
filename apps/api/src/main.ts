import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

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
    origin: process.env.CORS_ORIGINS,
    credentials: true,
  })

  app.use(cookieParser())

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Orbit API')
    .setDescription('Comprehensive Project Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const PORT = process.env.PORT || 5000

  await app.listen(PORT)

  logger.log(`🚀 Orbit API is running on: http://localhost:${PORT}/api/v1`)
  logger.log(`📚 Swagger docs available at: http://localhost:${PORT}/api/docs`)
}

void bootstrap()
