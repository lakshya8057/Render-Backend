import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreatePhotoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}