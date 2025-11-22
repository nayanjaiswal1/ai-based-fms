import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'Add $50 expense for groceries at Walmart' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({ example: { accountId: 'uuid' } })
  @IsOptional()
  context?: Record<string, any>;
}

export class CreateConversationDto {
  @ApiProperty({ example: 'Budget Planning' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class ProcessCommandDto {
  @ApiProperty({ example: 'create transaction' })
  @IsString()
  command: string;

  @ApiProperty({ example: { description: 'Coffee', amount: 5.50 } })
  params: Record<string, any>;
}

export class ProcessDocumentDto {
  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ example: 'openai', enum: ['openai', 'gemini', 'ocr_space'] })
  @IsOptional()
  @IsString()
  provider?: string;
}
