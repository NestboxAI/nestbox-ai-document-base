import { ApiProperty } from "@nestjs/swagger";
import {
    IsString,
} from 'class-validator';


export class CreateCollectionRequestDTO {
    @ApiProperty()
    @IsString()
    name: string;
}