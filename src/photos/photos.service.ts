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

  /** Upload a new photo and save metadata to DB */
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

  /** Get all photos, newest first */
  async findAll() {
    return this.prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get a single photo by ID */
  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException(`Photo with ID "${id}" not found`);
    return photo;
  }

  /** Update photo title/description */
  async update(id: string, dto: UpdatePhotoDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.photo.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  /** Delete photo record and file from disk */
  async remove(id: string) {
    const photo = await this.findOne(id);

    // Remove file from disk
    const uploadDir = this.config.get('UPLOAD_DIR', 'uploads');
    const filePath = path.join(process.cwd(), uploadDir, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await this.prisma.photo.delete({ where: { id } });
    return { message: `Photo "${photo.title}" deleted successfully` };
  }

  /** Gallery stats */
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
