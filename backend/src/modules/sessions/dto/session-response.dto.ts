import { DeviceInfo } from '@database/entities';

export class SessionResponseDto {
  id: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string;
  lastActive: Date;
  createdAt: Date;
  isActive: boolean;
  isCurrent?: boolean;
}
