import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for React frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global API prefix
  app.setGlobalPrefix('api');

  // Ensure uploads directory exists
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const uploadPath = path.join(process.cwd(), uploadDir);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`SnapVault API running on http://localhost:${port}/api`);
}
bootstrap();
