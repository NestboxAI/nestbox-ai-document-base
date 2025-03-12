import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class SimilaritySearchQueryDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    query: string;
    
    @ApiProperty()
    @IsObject()
    @IsOptional()
    params?: {
        topK?: number;
        [key: string]: any;
    };
    
    @ApiProperty()
    @IsObject()
    @IsOptional()
    filter?: Record<string, any>;
    
    @ApiProperty({ 
      type: [String],
      example: ['embedding']
    })
    @IsArray()
    @IsOptional()
    include?: string[];
}