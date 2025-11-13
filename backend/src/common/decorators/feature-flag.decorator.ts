import { SetMetadata } from '@nestjs/common';
import { FeatureFlag } from '../constants/features.constants';

/**
 * Decorator to protect routes with feature flags
 * Usage: @RequireFeature(FeatureFlag.ADVANCED_ANALYTICS)
 */
export const RequireFeature = (feature: FeatureFlag) => SetMetadata('feature', feature);

/**
 * Decorator to mark routes that require specific subscription tier
 * This is automatically checked by the FeatureAccessGuard
 */
export const RequireTier = (tier: string) => SetMetadata('requiredTier', tier);
