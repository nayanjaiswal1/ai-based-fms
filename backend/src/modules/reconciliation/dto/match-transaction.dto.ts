import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class MatchTransactionDto {
  @IsNotEmpty()
  @IsString()
  reconciliationTransactionId: string;

  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsOptional()
  @IsBoolean()
  isManual?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UnmatchTransactionDto {
  @IsNotEmpty()
  @IsString()
  reconciliationTransactionId: string;
}
