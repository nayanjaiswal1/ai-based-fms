import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, SubscriptionTier } from '@database/entities';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateSubscriptionDto {
  @ApiProperty({ enum: SubscriptionTier })
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;
}

export class SuspendUserDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isSuspended: boolean;

  @ApiPropertyOptional({ example: 'Violation of terms' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SystemStatsDto {
  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  days?: number;
}
