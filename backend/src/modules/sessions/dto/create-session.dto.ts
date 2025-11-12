import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { DeviceInfo } from '@database/entities';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsObject()
  @IsNotEmpty()
  deviceInfo: DeviceInfo;

  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
