import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Global validation pipeline
  const validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  })

  app.useGlobalPipes(validationPipe)

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  })

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Orbit API')
    .setDescription('Comprehensive Project Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 5000

  await app.listen(port)

  logger.log(`🚀 Orbit API is running on: http://localhost:${port}/api/v1`)
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`)
}

void bootstrap()
