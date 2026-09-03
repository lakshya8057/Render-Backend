import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdatePhotoDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
