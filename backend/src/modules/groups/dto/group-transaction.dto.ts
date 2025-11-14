import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsObject,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SplitType } from '@database/entities';

export class CreateGroupTransactionDto {
  @ApiProperty({ example: 'Dinner at restaurant' })
  @IsString()
  description: string;

  @ApiProperty({ example: 120.5 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  paidBy: string;

  @ApiProperty({
    enum: SplitType,
    example: SplitType.EQUAL,
    description: 'How to split the expense: equal, custom, percentage, or shares',
  })
  @IsEnum(SplitType)
  splitType: SplitType;

  @ApiProperty({
    example: { 'user1-uuid': 40.17, 'user2-uuid': 40.17, 'user3-uuid': 40.16 },
    description:
      'Amount owed by each member. For equal split, calculated automatically. For custom, provide specific amounts.',
  })
  @IsObject()
  splits: Record<string, number>;

  @ApiPropertyOptional({ example: 'Shared dinner expense' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: ['receipt.jpg'] })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateGroupTransactionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  splits?: Record<string, number>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSettlement?: boolean;
}

export class SettleUpDto {
  @ApiProperty({ example: 'user1-uuid' })
  @IsString()
  fromUserId: string;

  @ApiProperty({ example: 'user2-uuid' })
  @IsString()
  toUserId: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: '2025-01-20' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'Settled via cash' })
  @IsOptional()
  @IsString()
  notes?: string;
}
