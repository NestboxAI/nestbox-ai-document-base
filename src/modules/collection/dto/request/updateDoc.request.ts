import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateDocumentRequestDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  document?: string;

  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  @IsOptional()
  url?: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
