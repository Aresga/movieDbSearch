import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
// import * as https from 'https';

async function bootstrap() {
  const httpsOptions = {
    key : fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
  };
  
  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:5173', 'https://localhost:5173', 'http://backend-nest:5173', 'https://backend-nest:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
