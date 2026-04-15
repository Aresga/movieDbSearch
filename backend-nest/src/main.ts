import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
// import * as https from 'https';
import * as dotenv from 'dotenv'
import * as path from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { loadVaultSecrets } from './common/vault.loader';

async function bootstrap() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  try {
    // Fetch secrets from Vault before app initialization
    const secrets = await loadVaultSecrets();

    // Inject fetched secrets into process.env
    Object.assign(process.env, secrets);

    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api', {
      // Keep Prometheus scrape endpoint stable at /metrics.
      exclude: [{ path: 'metrics', method: RequestMethod.ALL }],
    });

    // Middleware and Security
    app.use(cookieParser());

    app.getHttpAdapter().getInstance().set('trust proxy', 1);

    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://moviedb.gagabuilds.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });

    // Global Validation Pipe
    app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    }));

    // Swagger Documentation
    const config = new DocumentBuilder()
      .setTitle('Moviedb API')
      .setDescription('The movieDb API')
      .setVersion('0.0')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      useGlobalPrefix: true,
    });

    // Start the server on 0.0.0.0 to allow external access
    await app.listen(3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);

  } catch (error: any) {
    console.error('Failed to start application:', error.message);
    process.exit(1);
  }
}

bootstrap();
