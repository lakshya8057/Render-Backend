import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseInterceptors, UploadedFile,
  ParseUUIDPipe, HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

const storage = diskStorage({
  destination: join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${extname(file.originalname)}`);
  },
});

const imageFileFilter = (req: any, file: any, cb: any) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new BadRequestException('Only JPEG, PNG, GIF, WEBP images allowed'), false);
};

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
  }))
  async create(
    @Body() createPhotoDto: CreatePhotoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.photosService.create(createPhotoDto, file);
  }

  @Get()
  async findAll() {
    return this.photosService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.photosService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.photosService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ) {
    return this.photosService.update(id, updatePhotoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.photosService.remove(id);
  }
}