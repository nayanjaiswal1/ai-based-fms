import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Feature, isFeatureEnabled } from '../constants/feature-limits';

export const FEATURE_KEY = 'feature';

@Injectable()
export class FeatureGateGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<Feature>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true; // No feature gate required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userTier = user.subscriptionTier || 'FREE';

    if (!isFeatureEnabled(userTier, requiredFeature)) {
      throw new ForbiddenException(
        `This feature requires ${this.getRequiredTier(requiredFeature)} plan or higher. Please upgrade your subscription.`
      );
    }

    return true;
  }

  private getRequiredTier(feature: Feature): string {
    // Simple mapping - in production, this could be more sophisticated
    const proFeatures = [
      Feature.BULK_IMPORT,
      Feature.ADVANCED_SEARCH,
      Feature.GROUP_ANALYTICS,
      Feature.RECURRING_TRANSACTIONS,
      Feature.AI_CATEGORIZATION,
      Feature.ADVANCED_REPORTS,
    ];

    const enterpriseFeatures = [
      Feature.AI_INSIGHTS,
      Feature.PREDICTIVE_ANALYTICS,
      Feature.SCHEDULED_REPORTS,
      Feature.PRIORITY_SUPPORT,
    ];

    if (enterpriseFeatures.includes(feature)) return 'ENTERPRISE';
    if (proFeatures.includes(feature)) return 'PRO';
    return 'FREE';
  }
}
