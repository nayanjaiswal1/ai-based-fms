import { SetMetadata } from '@nestjs/common';
import { UsageLimitConfig, USAGE_LIMIT_KEY } from '../guards/usage-limit.guard';

export const CheckUsageLimit = (config: UsageLimitConfig) => SetMetadata(USAGE_LIMIT_KEY, config);
