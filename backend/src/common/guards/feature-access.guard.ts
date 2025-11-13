import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service';
import { FeatureFlag, getRequiredTier } from '../constants/features.constants';

@Injectable()
export class FeatureAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<FeatureFlag>('feature', context.getHandler());

    if (!requiredFeature) {
      // No feature requirement, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasAccess = await this.subscriptionsService.checkFeatureAccess(userId, requiredFeature);

    if (!hasAccess) {
      const requiredTier = getRequiredTier(requiredFeature);
      throw new ForbiddenException(
        `This feature requires ${requiredTier} subscription. Please upgrade to access this feature.`,
      );
    }

    return true;
  }
}
