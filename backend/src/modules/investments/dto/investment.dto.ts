import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvestmentType } from '@database/entities';

export class CreateInvestmentDto {
  @ApiProperty({ example: 'Apple Inc. Stock' })
  @IsString()
  name: string;

  @ApiProperty({ enum: InvestmentType, example: InvestmentType.STOCKS })
  @IsEnum(InvestmentType)
  type: InvestmentType;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  investedAmount: number;

  @ApiProperty({ example: 6200 })
  @IsNumber()
  @Min(0)
  currentValue: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  investmentDate: string;

  @ApiPropertyOptional({ example: '2027-01-15' })
  @IsOptional()
  @IsDateString()
  maturityDate?: string;

  @ApiPropertyOptional({ example: 'Fidelity' })
  @IsOptional()
  @IsString()
  broker?: string;

  @ApiPropertyOptional({ example: 'ACC-123456' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateInvestmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  maturityDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  broker?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
