import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreatePhotoDto, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image file is required');
    return this.prisma.photo.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  async findAll() {
    return this.prisma.photo.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException(Photo with ID "" not found);
    return photo;
  }

  async update(id: string, dto: UpdatePhotoDto) {
    await this.findOne(id);
    return this.prisma.photo.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async remove(id: string) {
    const photo = await this.findOne(id);
    const uploadDir = this.config.get('UPLOAD_DIR', 'uploads');
    const filePath = path.join(process.cwd(), uploadDir, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await this.prisma.photo.delete({ where: { id } });
    return { message: Photo "" deleted successfully };
  }

  async getStats() {
    const [count, aggregate] = await Promise.all([
      this.prisma.photo.count(),
      this.prisma.photo.aggregate({ _sum: { size: true } }),
    ]);
    return {
      totalPhotos: count,
      totalSize: Number(aggregate._sum.size ?? 0),
    };
  }
}