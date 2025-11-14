import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LendBorrowType } from '@database/entities';

export class CreateLendBorrowDto {
  @ApiProperty({ enum: LendBorrowType, example: LendBorrowType.LEND })
  @IsEnum(LendBorrowType)
  type: LendBorrowType;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  personName: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsString()
  personEmail?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  personPhone?: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '2025-02-15' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Lent money for emergency' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: ['promissory-note.pdf'] })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class UpdateLendBorrowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordPaymentDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2025-01-20' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Partial repayment' })
  @IsOptional()
  @IsString()
  notes?: string;
}
