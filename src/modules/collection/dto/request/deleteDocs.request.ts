import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class DeleteDocsRequestDTO {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  metadataFilter: Record<string, any>;
}
