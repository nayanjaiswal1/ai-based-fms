import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus } from '@database/entities';

export class CleanJobsDto {
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  olderThanDays?: number = 30;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number;
}
