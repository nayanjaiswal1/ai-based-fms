import { IsOptional, IsBoolean } from 'class-validator';

export class RetryJobDto {
  @IsOptional()
  @IsBoolean()
  resetAttempts?: boolean = true;
}
