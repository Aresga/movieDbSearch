import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
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

    // Setup HTTPS options (Reading from local files)
    // const httpsOptions = {
    // key : fs.readFileSync('./key.pem'),
    // cert: fs.readFileSync('./cert.pem'),
    // };

    // Create NestJS application with HTTPS
    const app = await NestFactory.create(AppModule);
    
    // Middleware and Security
    app.use(cookieParser());

    app.enableCors({
      origin: [
        'http://localhost:5173',
        'https://localhost:5173',
        'http://localhost',
        'https://localhost',
        'http://backend-nest:3000'
      ],
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
    SwaggerModule.setup('api', app, document);

    // Start the server on 0.0.0.0 to allow external access
    await app.listen(3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);

  } catch (error: any) {
    console.error('Failed to start application:', error.message);
    process.exit(1);
  }
}

bootstrap();
