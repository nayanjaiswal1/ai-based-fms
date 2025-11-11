import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AutoCategorizeDto {
  @ApiProperty({ example: 'Starbucks Coffee Purchase' })
  @IsString()
  description: string;

  @ApiProperty({ example: 12.50 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'Starbucks Seattle' })
  @IsOptional()
  @IsString()
  merchantName?: string;
}

export class ParseReceiptDto {
  @ApiProperty({ example: 'Receipt text content or base64 image...' })
  @IsString()
  receiptData: string;

  @ApiPropertyOptional({ example: 'text', enum: ['text', 'image'] })
  @IsOptional()
  @IsString()
  dataType?: 'text' | 'image';
}

export class DetectDuplicatesDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  transactionId: string;
}

export class GenerateInsightsDto {
  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class NaturalLanguageQueryDto {
  @ApiProperty({ example: 'How much did I spend on food this month?' })
  @IsString()
  query: string;
}

export class SmartSuggestionsDto {
  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
