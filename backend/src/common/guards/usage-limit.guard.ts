import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getFeatureLimits, FeatureLimits } from '../constants/feature-limits';

export const USAGE_LIMIT_KEY = 'usageLimit';

export interface UsageLimitConfig {
  limitType: keyof FeatureLimits;
  currentCountGetter: (userId: string, context: ExecutionContext) => Promise<number>;
}

@Injectable()
export class UsageLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.getAllAndOverride<UsageLimitConfig>(USAGE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!config) {
      return true; // No usage limit required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userTier = user.subscriptionTier || 'FREE';
    const limits = getFeatureLimits(userTier);
    const limit = limits[config.limitType];

    // null means unlimited
    if (limit === null || typeof limit === 'object') {
      return true;
    }

    const currentCount = await config.currentCountGetter(user.id, context);

    if (currentCount >= limit) {
      throw new ForbiddenException(
        `You have reached the maximum ${config.limitType.replace('max', '').toLowerCase()} limit (${limit}) for your ${userTier} plan. Please upgrade to continue.`,
      );
    }

    return true;
  }
}
