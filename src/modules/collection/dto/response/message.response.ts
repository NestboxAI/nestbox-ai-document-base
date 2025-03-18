import { ApiProperty } from '@nestjs/swagger';

export default class MessageResponseDTO {
  @ApiProperty()
  message: string;
}
