import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class CreateDocumentRequestDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  metadata: Record<string, any>;
}
