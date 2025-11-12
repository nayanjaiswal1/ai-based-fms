import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';

export enum QueueAction {
  PAUSE = 'pause',
  RESUME = 'resume',
  CLEAN = 'clean',
  DRAIN = 'drain',
}

export class QueueControlDto {
  @IsEnum(QueueAction)
  action: QueueAction;

  @IsOptional()
  @IsInt()
  @Min(0)
  grace?: number; // Grace period in milliseconds for pause/drain
}
