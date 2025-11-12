import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StartReconciliationDto {
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  statementBalance: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
