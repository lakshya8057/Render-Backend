import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Photo } from './photo.entity';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    private readonly configService: ConfigService,
  ) {}

  /** Upload a new photo and save metadata to DB */
  async create(createPhotoDto: CreatePhotoDto, file: Express.Multer.File): Promise<Photo> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const photo = this.photoRepository.create({
      title: createPhotoDto.title,
      description: createPhotoDto.description,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
    return this.photoRepository.save(photo);
  }

  /** Get all photos, newest first */
  async findAll(): Promise<Photo[]> {
    return this.photoRepository.find({ order: { createdAt: 'DESC' } });
  }

  /** Get a single photo by ID */
  async findOne(id: string): Promise<Photo> {
    const photo = await this.photoRepository.findOne({ where: { id } });
    if (!photo) throw new NotFoundException(`Photo with ID "${id}" not found`);
    return photo;
  }

  /** Update photo title/description */
  async update(id: string, updatePhotoDto: UpdatePhotoDto): Promise<Photo> {
    const photo = await this.findOne(id);
    Object.assign(photo, updatePhotoDto);
    return this.photoRepository.save(photo);
  }

  /** Delete photo record and file from disk */
  async remove(id: string): Promise<{ message: string }> {
    const photo = await this.findOne(id);
    const uploadDir = this.configService.get('UPLOAD_DIR', 'uploads');
    const filePath = path.join(process.cwd(), uploadDir, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await this.photoRepository.remove(photo);
    return { message: `Photo "${photo.title}" deleted successfully` };
  }

  /** Gallery stats */
  async getStats(): Promise<{ totalPhotos: number; totalSize: number }> {
    const result = await this.photoRepository
      .createQueryBuilder('photo')
      .select('COUNT(photo.id)', 'totalPhotos')
      .addSelect('SUM(photo.size)', 'totalSize')
      .getRawOne();
    return {
      totalPhotos: parseInt(result.totalPhotos) || 0,
      totalSize: parseInt(result.totalSize) || 0,
    };
  }
}
