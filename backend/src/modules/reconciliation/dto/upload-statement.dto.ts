import { IsNotEmpty, IsArray, ValidateNested, IsNumber, IsDateString, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StatementTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

export class UploadStatementDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatementTransactionDto)
  transactions: StatementTransactionDto[];

  @IsOptional()
  @IsString()
  statementPassword?: string; // Password for password-protected statements

  @IsOptional()
  @IsString()
  rememberPassword?: string; // 'true' if user wants to save password for future use
}
