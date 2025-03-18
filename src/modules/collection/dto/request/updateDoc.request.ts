import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class UpdateDocumentRequestDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  document?: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
