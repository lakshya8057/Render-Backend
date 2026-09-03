import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PhotosModule } from './photos/photos.module';
import { Photo } from './photos/photo.entity';

@Module({
  imports: [
    // Load .env file globally
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL via TypeORM using DATABASE_URL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Photo],
        synchronize: true, // auto-create tables in dev
        logging: false,
        ssl: config.get('DATABASE_URL', '').includes('localhost')
          ? false
          : { rejectUnauthorized: false }, // allow SSL for cloud DBs (e.g. Render, Supabase)
      }),
      inject: [ConfigService],
    }),

    // Serve uploaded images statically at /uploads/*
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
      serveRoot: '/uploads',
    }),

    PhotosModule,
  ],
})
export class AppModule {}
